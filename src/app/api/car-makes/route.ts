import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const carMakes = await db.carMake.findMany({
      include: {
        models: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(carMakes);
  } catch (error) {
    console.error("Error fetching car makes:", error);
    return NextResponse.json(
      { error: "Failed to fetch car makes" },
      { status: 500 }
    );
  }
}
