"use client";

import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useSearchParams, usePathname } from "next/navigation";

/**
 * Component to sync OAuth users to database after authentication
 * Runs after OAuth redirect to ensure user data is saved
 * Note: Redirects are handled by AuthRedirectHandler, not here
 */
export const OAuthSyncHandler = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, sessionId } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isSyncingRef = useRef(false);
  const oauthCallback = searchParams.get("__clerk_redirect_url") || searchParams.get("__clerk_handshake");

  useEffect(() => {
    // Only run if:
    // 1. User is loaded
    // 2. User is signed in
    // 3. Session exists
    if (!userLoaded || !isSignedIn || !user || !sessionId) {
      return;
    }

    // Skip if already syncing
    if (isSyncingRef.current) {
      return;
    }

    // Check if we've already synced this user in this session
    const storageKey = `oauth_synced_${user.id}`;
    let hasSynced = false;

    try {
      if (typeof window !== "undefined") {
        hasSynced = !!sessionStorage.getItem(storageKey);
      }
    } catch {
      // sessionStorage might not be available
    }

    if (hasSynced) {
      return;
    }

    // Check if user has OAuth connections (Google or Facebook)
    const hasOAuthConnection =
      user.externalAccounts &&
      user.externalAccounts.length > 0 &&
      user.externalAccounts.some(
        (account) => {
          const provider = account.provider as string;
          return provider === "oauth_google" || provider === "oauth_facebook" || provider === "google" || provider === "facebook";
        }
      );

    // Check if this is likely an OAuth callback
    const isOAuthCallback = !!oauthCallback || hasOAuthConnection;

    // Only sync OAuth users or if we're coming from OAuth callback
    if (!isOAuthCallback) {
      return;
    }

    // Skip if we're on auth pages - let them handle their own logic
    // BUT allow sso-callback page to sync
    if ((pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") ||
        pathname.startsWith("/complete-profile")) && !pathname.startsWith("/sso-callback")) {
      return;
    }

    // Sync user to database (without redirecting - let AuthRedirectHandler handle that)
    const syncUser = async () => {
      // Prevent concurrent syncs
      if (isSyncingRef.current) {
        return;
      }
      isSyncingRef.current = true;

      try {
        // Mark as syncing in sessionStorage immediately
        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(`oauth_syncing_${user.id}`, Date.now().toString());
          }
        } catch {
          // Ignore sessionStorage errors
        }

        const response = await fetch("/api/user/oauth-sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("OAuth sync error:", error);
          // Clear syncing flag on error so we can retry
          try {
            if (typeof window !== "undefined") {
              sessionStorage.removeItem(`oauth_syncing_${user.id}`);
            }
          } catch {
            // Ignore sessionStorage errors
          }
          isSyncingRef.current = false;
          return;
        }

        const data = await response.json();
        if (data.success) {
          console.log("OAuth user synced successfully");

          // Mark as synced in sessionStorage
          try {
            if (typeof window !== "undefined") {
              sessionStorage.removeItem(`oauth_syncing_${user.id}`);
              sessionStorage.setItem(storageKey, "synced");
            }
          } catch {
            // Ignore sessionStorage errors
          }

          // Don't redirect here - let AuthRedirectHandler handle redirects
          // This prevents infinite loops from window.location.href
        }
      } catch (error) {
        console.error("Failed to sync OAuth user:", error);
        // Clear flags on error so we can retry
        try {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(`oauth_syncing_${user.id}`);
          }
        } catch {
          // Ignore sessionStorage errors
        }
        isSyncingRef.current = false;
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Check if another sync is in progress
    try {
      if (typeof window !== "undefined") {
        const syncingKey = `oauth_syncing_${user.id}`;
        const isSyncing = sessionStorage.getItem(syncingKey);
        if (isSyncing) {
          // Another sync is in progress, skip
          return;
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }

    syncUser();
  }, [userLoaded, isSignedIn, user, sessionId, oauthCallback, pathname]);

  return null; // This component doesn't render anything
};

