/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Get body data from frontend
    const body = await req.json();
    const { email, password, firstName, lastName, mobileNumber } = body;

    // Store only basic user data
    const user = await db.users.create({
      data: {
        email,
        password,
        firstName,
        lastName,
        mobileNumber,
        isEmailVerified: false,
        userType: "CUSTOMER", // Default to customer for new signups
      },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err: any) {
    console.error("User creation error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
