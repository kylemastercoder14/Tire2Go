"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
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
  const isCheckingRef = useRef(false); // Prevent concurrent checks

  useEffect(() => {
    // Only run if user is loaded and signed in
    if (!isLoaded || !user) {
      return;
    }

    // Skip if we're on an auth page - let the auth pages handle their own redirects
    if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") ||
        pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password") ||
        pathname.startsWith("/verify-email") || pathname.startsWith("/complete-profile")) {
      return;
    }

    // Prevent concurrent checks
    if (isCheckingRef.current) {
      return;
    }

    // Safely check sessionStorage (might not be available in SSR)
    const storageKey = `auth_redirect_checked_${user.id}`;
    let lastChecked: string | null = null;
    let lastPathname: string | null = null;

    try {
      if (typeof window !== "undefined") {
        lastChecked = sessionStorage.getItem(storageKey);
        lastPathname = sessionStorage.getItem(`${storageKey}_pathname`);
      }
    } catch {
      // sessionStorage might not be available, continue anyway
    }

    // Skip if we've already checked this exact pathname for this user
    if (lastChecked && lastPathname === pathname) {
      return;
    }

    // Skip checking if user is already on the correct route for their type
    // This prevents unnecessary API calls
    const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
    const isAdminPage = pathname.startsWith("/admin");

    // If customer is on a valid customer route (not admin, not auth), skip check
    if (!isAuthPage && !isAdminPage && lastPathname && lastPathname !== pathname) {
      // Pathname changed but user is still on a valid route - might be navigation
      // Only check if we haven't checked recently (within 5 seconds)
      const checkTime = lastChecked ? parseInt(lastChecked, 10) : 0;
      const timeSinceCheck = Date.now() - checkTime;
      if (timeSinceCheck < 5000) {
        // Recently checked, skip
        return;
      }
    }

    // Check user type and redirect accordingly
    const checkUserTypeAndRedirect = async () => {
      // Double-check to prevent concurrent execution
      if (isCheckingRef.current) {
        return;
      }
      isCheckingRef.current = true;

      try {
        const response = await fetch("/api/user/check-type");
        const data = await response.json();

        if (data.success) {
          const { userType } = data;

          // Store that we've checked for this user
          try {
            if (typeof window !== "undefined") {
              sessionStorage.setItem(storageKey, Date.now().toString());
              sessionStorage.setItem(`${storageKey}_pathname`, pathname);
            }
          } catch {
            // Ignore storage errors
          }

          // ADMIN users: Redirect to admin dashboard
          if (userType === "ADMIN") {
            // If admin is on a customer route (not admin route), redirect to dashboard
            if (!pathname.startsWith("/admin")) {
              try {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem(`${storageKey}_pathname`, "/admin/dashboard");
                }
              } catch {
                // Ignore storage errors
              }
              router.replace("/admin/dashboard");
              return;
            }
          }
          // CUSTOMER users: Redirect to root page if on admin route
          else if (userType === "CUSTOMER") {
            // If customer is on admin page, redirect to home and show error
            if (pathname.startsWith("/admin")) {
              toast.error("Access denied. You don't have permission to access this page.");
              try {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem(`${storageKey}_pathname`, "/");
                }
              } catch {
                // Ignore storage errors
              }
              router.replace("/");
              return;
            }
            // Customer is on a valid customer route - no redirect needed
            // Just mark as checked so we don't check again
          }
        }
      } catch (error) {
        console.error("Error checking user type for redirect:", error);
        // Mark as checked even on error to prevent infinite loops
        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(storageKey, Date.now().toString());
            sessionStorage.setItem(`${storageKey}_pathname`, pathname);
          }
        } catch {
          // Ignore storage errors
        }
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Add a delay to prevent race conditions with sign-in redirects
    const timeoutId = setTimeout(checkUserTypeAndRedirect, 200);
    return () => {
      clearTimeout(timeoutId);
      isCheckingRef.current = false;
    };
  }, [isLoaded, user, pathname, router]);

  return null; // This component doesn't render anything
};

