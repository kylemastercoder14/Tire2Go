import { NextRequest, NextResponse } from "next/server";
import { placeOrder, PlaceOrderRequest } from "@/test/lalamove-delivery/lib/lalamove";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quotationId, sender, recipients, metadata } = body;

    if (!quotationId) {
      return NextResponse.json(
        { error: "quotationId is required" },
        { status: 400 }
      );
    }

    const orderRequest: PlaceOrderRequest = {
      quotationId,
    };

    if (sender) {
      orderRequest.sender = sender;
    }

    if (recipients && recipients.length > 0) {
      orderRequest.recipients = recipients;
    }

    if (metadata) {
      orderRequest.metadata = metadata;
    }

    const result = await placeOrder(orderRequest);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error placing order:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to place order",
      },
      { status: 500 }
    );
  }
}

