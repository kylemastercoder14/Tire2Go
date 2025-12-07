import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/reset-password(.*)",
  "/verify-email(.*)",
  "/complete-profile(.*)",
  "/",
  "/tips-and-advice(.*)",
  "/clearance-sale(.*)",
  "/tire(.*)",
  "/promos(.*)",
  "/car-models(.*)",
  "/track-order(.*)",
  "/tire-shop-solutions(.*)",
  "/privacy-policy(.*)",
  "/terms-and-conditions(.*)",
  "/faqs(.*)",
  "/about-us",
  "/contact-us",
  "/brands(.*)",
  "/api/user(.*)", // allow signup + verify API calls
  "/api/stats(.*)",
  "/api/database(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // For admin routes, just check if user is authenticated
  // The actual userType check will be done client-side in AuthRedirectHandler
  // This avoids Prisma Edge runtime issues
  if (isAdminRoute(req)) {
    const { userId } = await auth();

    if (!userId) {
      // User not authenticated, redirect to sign-in
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Note: User type check is handled client-side in AuthRedirectHandler
    // to avoid Prisma Edge runtime limitations
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
