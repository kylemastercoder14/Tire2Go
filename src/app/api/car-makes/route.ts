import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const carMakes = await db.carMake.findMany({
      orderBy: { name: "asc" },
      include: { models: { orderBy: { name: "asc" } } },
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

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Check if car make already exists
    const existingMake = await db.carMake.findFirst({
      where: { name: name.toUpperCase() },
    });

    if (existingMake) {
      return NextResponse.json(
        { error: "Car make already exists" },
        { status: 400 }
      );
    }

    const carMake = await db.carMake.create({
      data: { name: name.toUpperCase() },
    });

    return NextResponse.json(carMake, { status: 201 });
  } catch (error) {
    console.error("Error creating car make:", error);
    return NextResponse.json(
      { error: "Failed to create car make" },
      { status: 500 }
    );
  }
}