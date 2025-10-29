import { NextRequest, NextResponse } from "next/server";
import { getStatsByPeriod, Period } from "@/lib/api";

export async function GET(req: NextRequest) {
  const period =
    (req.nextUrl.searchParams.get("period") as Period) || "monthly";
  const stats = await getStatsByPeriod(period);
  return NextResponse.json(stats);
}
