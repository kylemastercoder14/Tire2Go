"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Component to handle redirects based on user type after authentication
 * - ADMIN users: Redirect to /admin/dashboard
 * - CUSTOMER users: Redirect to / (root page)
 */
export const AuthRedirectHandler = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Only run if user is loaded and signed in
    if (!isLoaded || !user || hasRedirectedRef.current) {
      return;
    }

    // Check user type and redirect accordingly
    const checkUserTypeAndRedirect = async () => {
      try {
        const response = await fetch("/api/user/check-type");
        const data = await response.json();

        if (data.success) {
          const { userType } = data;

          // ADMIN users: Redirect to admin dashboard
          if (userType === "ADMIN") {
            // If admin is on a customer route (not admin route), redirect to dashboard
            if (!pathname.startsWith("/admin")) {
              hasRedirectedRef.current = true;
              router.replace("/admin/dashboard");
              return;
            }
          }
          // CUSTOMER users: Redirect to root page if on admin route
          else if (userType === "CUSTOMER") {
            // If customer is on admin page, redirect to home and show error
            if (pathname.startsWith("/admin")) {
              hasRedirectedRef.current = true;
              toast.error("Access denied. You don't have permission to access this page.");
              router.replace("/");
              return;
            }
            // If customer is on auth pages (sign-in, sign-up, etc.), redirect to home
            if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
              hasRedirectedRef.current = true;
              router.replace("/");
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error checking user type for redirect:", error);
      }
    };

    checkUserTypeAndRedirect();
  }, [isLoaded, user, pathname, router, searchParams]);

  return null; // This component doesn't render anything
};

