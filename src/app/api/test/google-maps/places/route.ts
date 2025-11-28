import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side Google Maps Places API autocomplete
 * This is a fallback if client-side API doesn't work
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const input = searchParams.get("input");
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!input) {
      return NextResponse.json(
        { error: "input parameter is required" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Get country restriction from environment or default to both
    const countryRestriction = process.env.LALAMOVE_COUNTRY || "";
    let componentsParam = "country:ph|country:hk"; // Default: allow both

    if (countryRestriction === "HK") {
      componentsParam = "country:hk";
    } else if (countryRestriction === "PH") {
      componentsParam = "country:ph";
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&components=${componentsParam}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from Google Maps API");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching places:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch places",
      },
      { status: 500 }
    );
  }
}

