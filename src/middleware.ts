import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
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
  "/admin(.*)", // allow access to admin panel for now, later it should be protected
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
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
