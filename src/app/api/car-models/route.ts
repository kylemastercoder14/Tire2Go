import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const makeId = searchParams.get("makeId");

    if (makeId) {
      const carModels = await db.carModel.findMany({
        where: { makeId },
        orderBy: { name: "asc" },
        include: { make: true },
      });
      return NextResponse.json(carModels);
    }

    const carModels = await db.carModel.findMany({
      orderBy: { name: "asc" },
      include: { make: true },
    });

    return NextResponse.json(carModels);
  } catch (error) {
    console.error("Error fetching car models:", error);
    return NextResponse.json(
      { error: "Failed to fetch car models" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, makeId } = await request.json();

    if (!name || !makeId) {
      return NextResponse.json(
        { error: "Name and makeId are required" },
        { status: 400 }
      );
    }

    // Check if car model already exists for this make
    const existingModel = await db.carModel.findFirst({
      where: { 
        name: name.toUpperCase(),
        makeId 
      },
    });

    if (existingModel) {
      return NextResponse.json(
        { error: "Car model already exists for this make" },
        { status: 400 }
      );
    }

    const carModel = await db.carModel.create({
      data: { 
        name: name.toUpperCase(),
        makeId 
      },
    });

    return NextResponse.json(carModel, { status: 201 });
  } catch (error) {
    console.error("Error creating car model:", error);
    return NextResponse.json(
      { error: "Failed to create car model" },
      { status: 500 }
    );
  }
}