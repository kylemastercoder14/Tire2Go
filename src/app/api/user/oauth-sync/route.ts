/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { UAParser } from "ua-parser-js";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user data from Clerk
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);

    if (!clerkUser) {
      return NextResponse.json(
        { success: false, error: "User not found in Clerk" },
        { status: 404 }
      );
    }

    // Extract user data from Clerk
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const firstName = clerkUser.firstName || "";
    const lastName = clerkUser.lastName || "";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email not found in Clerk user" },
        { status: 400 }
      );
    }

    // Get IP and User-Agent for device info
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const uaHeader = req.headers.get("user-agent") || "unknown";
    const parser = new UAParser(uaHeader);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    let userAgent = uaHeader;
    if (browser.name && browser.version && os.name) {
      userAgent = `${browser.name} ${browser.version} on ${os.name} ${
        os.version || ""
      }`.trim();
    }

    // Check if user exists by authId or email
    const existingUserByAuthId = await db.users.findUnique({
      where: { authId: userId },
    });

    const existingUserByEmail = await db.users.findUnique({
      where: { email },
    });

    let user;

    if (existingUserByAuthId) {
      // User exists with this authId, update if needed
      user = await db.users.update({
        where: { authId: userId },
        data: {
          email,
          firstName,
          lastName,
          isEmailVerified: true,
          ipAddress,
          userAgent,
          deviceType: device.type || "desktop",
        },
      });
    } else if (existingUserByEmail) {
      // User exists with this email but different authId, update authId
      user = await db.users.update({
        where: { email },
        data: {
          authId: userId,
          firstName,
          lastName,
          isEmailVerified: true,
          ipAddress,
          userAgent,
          deviceType: device.type || "desktop",
        },
      });
    } else {
      // New user, create in database
      // Generate a random password for OAuth users (they won't use it)
      const randomPassword = `oauth_${Math.random().toString(36).slice(-16)}`;

      user = await db.users.create({
        data: {
          authId: userId,
          email,
          password: randomPassword, // OAuth users don't need password
          firstName,
          lastName,
          mobileNumber: "+630000000000", // Default placeholder, user can update later
          isEmailVerified: true,
          ipAddress,
          userAgent,
          deviceType: device.type || "desktop",
          userType: "CUSTOMER", // Default to customer for OAuth signups
        },
      });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (err: any) {
    console.error("OAuth sync error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

