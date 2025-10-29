import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST() {
  try {
    // Car makes and models data based on the reference
    const carData = [
      {
        make: "MITSUBISHI",
        models: ["LANCER EK X", "EVOLUTION", "MIRAGE", "MIRAGE G4"]
      },
      {
        make: "TOYOTA",
        models: ["VIOS", "ALTIS", "AVANZA", "COROLLA", "CAMRY", "WIGO", "YARIS"]
      },
      {
        make: "NISSAN",
        models: ["ALMERA", "SENTRA"]
      },
      {
        make: "HYUNDAI",
        models: ["ACCENT", "EON", "ELANTRA", "KONA", "SONATA"]
      },
      {
        make: "HONDA",
        models: ["CITY", "JAZZ", "FD", "FB", "FC", "CIVIC"]
      }
    ];

    // Create car makes and models
    for (const car of carData) {
      // Create or find car make
      let carMake = await db.carMake.findFirst({
        where: { name: car.make }
      });

      if (!carMake) {
        carMake = await db.carMake.create({
          data: { name: car.make }
        });
      }

      // Create car models
      for (const modelName of car.models) {
        const existingModel = await db.carModel.findFirst({
          where: {
            name: modelName,
            makeId: carMake.id
          }
        });

        if (!existingModel) {
          await db.carModel.create({
            data: {
              name: modelName,
              makeId: carMake.id
            }
          });
        }
      }
    }

    // Also seed some sample tire sizes
    const tireSizes = [
      { width: 205, ratio: 50, diameter: 16 },
      { width: 225, ratio: 45, diameter: 16 },
      { width: 245, ratio: 45, diameter: 16 },
      { width: 255, ratio: 40, diameter: 18 },
      { width: 265, ratio: 40, diameter: 18 },
      { width: 255, ratio: 40, diameter: 20 },
    ];

    for (const tireSize of tireSizes) {
      const existingTireSize = await db.tireSize.findFirst({
        where: {
          width: tireSize.width,
          ratio: tireSize.ratio,
          diameter: tireSize.diameter,
        }
      });

      if (!existingTireSize) {
        await db.tireSize.create({
          data: tireSize
        });
      }
    }

    return NextResponse.json({ 
      success: "Car data and tire sizes seeded successfully" 
    });
  } catch (error) {
    console.error("Error seeding car data:", error);
    return NextResponse.json(
      { error: "Failed to seed car data" },
      { status: 500 }
    );
  }
}