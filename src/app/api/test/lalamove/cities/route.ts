import { NextRequest, NextResponse } from "next/server";
import { getCityInfo } from "@/test/lalamove-delivery/lib/lalamove";

/**
 * Get available cities/markets from Lalamove
 * This endpoint helps debug which markets are available
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const country = searchParams.get("country") || "PH";
    const city = searchParams.get("city") || "MNL";

    const result = await getCityInfo(country, city);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error getting city info:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to get city info",
      },
      { status: 500 }
    );
  }
}

