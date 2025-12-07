/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { authId } = await req.json();

    if (!authId) {
      return NextResponse.json({ exists: false });
    }

    let user = await db.users.findFirst({
      where: { authId },
    });

    // If user doesn't exist, try to sync from Clerk (for OAuth users)
    if (!user) {
      try {
        const { userId } = await auth();
        if (userId === authId) {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(authId);

          // Check if this is an OAuth user
          const hasOAuthConnection =
            clerkUser.externalAccounts &&
            clerkUser.externalAccounts.length > 0 &&
            clerkUser.externalAccounts.some(
              (account) => {
                const provider = account.provider as string;
                return provider === "oauth_google" || provider === "oauth_facebook" || provider === "google" || provider === "facebook";
              }
            );

          if (hasOAuthConnection && clerkUser.emailAddresses[0]?.emailAddress) {
            // Try to sync OAuth user
            const email = clerkUser.emailAddresses[0].emailAddress;
            const firstName = clerkUser.firstName || "";
            const lastName = clerkUser.lastName || "";

            // Get IP and User-Agent
            const ipAddress =
              req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
            const uaHeader = req.headers.get("user-agent") || "unknown";

            // Check if user exists by email
            const existingUserByEmail = await db.users.findUnique({
              where: { email },
            });

            if (existingUserByEmail) {
              // Update existing user with authId
              user = await db.users.update({
                where: { email },
                data: {
                  authId,
                  firstName,
                  lastName,
                  isEmailVerified: true,
                  ipAddress,
                  userAgent: uaHeader,
                },
              });
            } else {
              // Create new OAuth user
              const randomPassword = `oauth_${Math.random().toString(36).slice(-16)}`;
              user = await db.users.create({
                data: {
                  authId,
                  email,
                  password: randomPassword,
                  firstName,
                  lastName,
                  mobileNumber: "+630000000000",
                  isEmailVerified: true,
                  ipAddress,
                  userAgent: uaHeader,
                },
              });
            }
          }
        }
      } catch (syncError) {
        // If sync fails, just continue - user will be redirected to complete-profile
        console.error("OAuth sync attempt failed:", syncError);
      }
    }

    return NextResponse.json({ exists: !!user });
  } catch (err: any) {
    console.error("Check profile API error:", err);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
