import { NextRequest, NextResponse } from "next/server";
import { getQuotation, QuotationRequest } from "@/test/lalamove-delivery/lib/lalamove";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pickup, delivery, serviceType, item, specialRequests, scheduleAt } = body;

    if (!pickup || !delivery || !serviceType) {
      return NextResponse.json(
        { error: "Missing required fields: pickup, delivery, serviceType" },
        { status: 400 }
      );
    }

    // Prepare stops for Lalamove
    const stops: QuotationRequest["stops"] = [
      {
        coordinates: {
          lat: pickup.coordinates.lat.toString(),
          lng: pickup.coordinates.lng.toString(),
        },
        address: pickup.address,
        displayAddress: pickup.formattedAddress || pickup.address,
        contactName: pickup.contactName || "Sender",
        contactPhone: pickup.contactPhone,
        remarks: pickup.remarks,
      },
      {
        coordinates: {
          lat: delivery.coordinates.lat.toString(),
          lng: delivery.coordinates.lng.toString(),
        },
        address: delivery.address,
        displayAddress: delivery.formattedAddress || delivery.address,
        contactName: delivery.contactName || "Recipient",
        contactPhone: delivery.contactPhone,
        remarks: delivery.remarks,
      },
    ];

    // Determine city code from pickup coordinates
    const pickupLat = parseFloat(pickup.coordinates.lat.toString());
    const pickupLng = parseFloat(pickup.coordinates.lng.toString());

    // Determine city code based on coordinates
    let detectedCity: string;
    const envCountry = process.env.LALAMOVE_COUNTRY || "";

    // Hong Kong (common sandbox market)
    if (pickupLat >= 22.0 && pickupLat <= 22.6 && pickupLng >= 113.8 && pickupLng <= 114.5) {
      detectedCity = "HKG"; // Hong Kong
    }
    // Philippines - Manila area
    else if (pickupLat >= 14.0 && pickupLat <= 14.8 && pickupLng >= 120.5 && pickupLng <= 121.5) {
      detectedCity = "MNL"; // Manila - Metro Manila and surrounding provinces (Cavite, Laguna, etc.)
    }
    // Philippines - Cebu area
    else if (pickupLat >= 10.0 && pickupLat <= 10.5 && pickupLng >= 123.5 && pickupLng <= 124.0) {
      detectedCity = "CEB"; // Cebu
    }
    // Use environment variable or default
    else {
      if (envCountry === "HK") {
        detectedCity = process.env.LALAMOVE_CITY || "HKG";
      } else {
        detectedCity = process.env.LALAMOVE_CITY || "HKG"; // Default to HKG for sandbox testing
      }
    }

    const country = process.env.LALAMOVE_COUNTRY || "PH";
    const market = `${country}_${detectedCity}`; // Format: PH_MNL

    const quotationRequest: QuotationRequest = {
      serviceType,
      stops,
      language: "en_US",
      market, // Add market to request body
    };

    if (specialRequests && specialRequests.length > 0) {
      quotationRequest.specialRequests = specialRequests;
    }

    if (item) {
      quotationRequest.item = item;
    }

    if (scheduleAt) {
      quotationRequest.scheduleAt = scheduleAt;
    }

    console.log("Quotation request - City detection:", {
      pickupLat,
      pickupLng,
      detectedCity: detectedCity,
      envCity: process.env.LALAMOVE_CITY,
      market: market,
    });

    const result = await getQuotation(quotationRequest, detectedCity);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error getting quotation:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to get quotation",
      },
      { status: 500 }
    );
  }
}
