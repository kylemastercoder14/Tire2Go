/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { authId } = await req.json();

    if (!authId) {
      return NextResponse.json({ exists: false });
    }

    const user = await db.users.findFirst({
      where: { authId },
    });

    return NextResponse.json({ exists: !!user });
  } catch (err: any) {
    console.error("Check profile API error:", err);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
