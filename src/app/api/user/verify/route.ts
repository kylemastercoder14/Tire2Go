/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { UAParser } from "ua-parser-js";

export async function POST(req: NextRequest) {
  try {
    const { email, authId } = await req.json();

    // Get IP safely from headers
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

    // Parse User-Agent
    const uaHeader = req.headers.get("user-agent") || "unknown";
    const parser = new UAParser(uaHeader);

    const browser = parser.getBrowser(); // { name, version }
    const os = parser.getOS(); // { name, version }
    const device = parser.getDevice(); // { model, type, vendor }

    // Format similar to Clerk: "Chrome 140.0.0.0 on Windows 10"
    let userAgent = uaHeader;
    if (browser.name && browser.version && os.name) {
      userAgent = `${browser.name} ${browser.version} on ${os.name} ${
        os.version || ""
      }`.trim();
    }

    // Ensure user exists
    const existingUser = await db.users.findUnique({ where: { email } });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: `No user found with email: ${email}` },
        { status: 404 }
      );
    }

    // Update user record with device info
    await db.users.update({
      where: { email },
      data: {
        isEmailVerified: true,
        authId,
        ipAddress,
        userAgent,
        deviceType: device.type || "desktop", // optional: mobile/tablet/desktop
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email verify update error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
