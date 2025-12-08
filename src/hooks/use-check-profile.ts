"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

export function useCheckProfile() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const hasCheckedRef = useRef(false);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) {
      return;
    }

    // If no user, just stop loading
    if (!user) {
      setLoading(false);
      return;
    }

    // Skip if we're already on the complete-profile page
    if (pathname === "/complete-profile") {
      setLoading(false);
      return;
    }

    // Skip if we've already checked for this user in this session
    const storageKey = `profile_checked_${user.id}`;
    const checkingKey = `profile_checking_${user.id}`;

    try {
      if (typeof window !== "undefined") {
        // Check if already checked
        const hasChecked = sessionStorage.getItem(storageKey);
        if (hasChecked) {
          setLoading(false);
          return;
        }

        // Check if currently checking (prevent concurrent calls)
        const isChecking = sessionStorage.getItem(checkingKey);
        if (isChecking) {
          // Another check is in progress, wait a bit and skip
          setLoading(false);
          return;
        }

        // Mark as checking immediately to prevent concurrent calls
        sessionStorage.setItem(checkingKey, Date.now().toString());
      }
    } catch {
      // sessionStorage might not be available
    }

    // Prevent concurrent checks using refs (backup)
    if (isCheckingRef.current || hasCheckedRef.current) {
      return;
    }

    const checkProfile = async () => {
      // Double-check to prevent concurrent execution
      if (isCheckingRef.current || hasCheckedRef.current) {
        return;
      }

      isCheckingRef.current = true;

      try {
        // Mark that we're checking/checked to prevent re-runs
        hasCheckedRef.current = true;

        // Call your API to check if user exists in DB
        const res = await fetch("/api/user/check-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authId: user.id }),
        });

        const data = await res.json();

        // Mark as checked in sessionStorage (remove checking flag)
        try {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(checkingKey);
            sessionStorage.setItem(storageKey, "checked");
          }
        } catch {
          // Ignore sessionStorage errors
        }

        if (!data.exists) {
          // Only redirect if we're not already on the complete-profile page
          if (pathname !== "/complete-profile") {
            router.replace("/complete-profile");
          }
        }
      } catch (err) {
        console.error("Profile check error:", err);
        // Reset flags on error so we can retry
        hasCheckedRef.current = false;
        try {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(storageKey);
            sessionStorage.removeItem(checkingKey);
          }
        } catch {
          // Ignore sessionStorage errors
        }
      } finally {
        setLoading(false);
        isCheckingRef.current = false;
      }
    };

    checkProfile();
  }, [isLoaded, user, pathname]); // Removed router from dependencies - it's stable

  return { loading };
}
