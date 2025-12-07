"use client";

import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

/**
 * Component to sync OAuth users to database after authentication
 * Runs after OAuth redirect to ensure user data is saved
 */
export const OAuthSyncHandler = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, sessionId } = useAuth();
  const searchParams = useSearchParams();
  const hasSyncedRef = useRef(false);
  const oauthCallback = searchParams.get("__clerk_redirect_url") || searchParams.get("__clerk_handshake");

  useEffect(() => {
    // Only run if:
    // 1. User is loaded
    // 2. User is signed in
    // 3. Session exists
    // 4. We haven't synced this user yet
    if (!userLoaded || !isSignedIn || !user || !sessionId || hasSyncedRef.current) {
      return;
    }

    // Check if user has OAuth connections (Google or Facebook)
    const hasOAuthConnection =
      user.externalAccounts &&
      user.externalAccounts.length > 0 &&
      user.externalAccounts.some(
        (account) =>
          account.provider === "oauth_google" ||
          account.provider === "oauth_facebook"
      );

    // Check if this is likely an OAuth callback
    const isOAuthCallback = !!oauthCallback || hasOAuthConnection;

    // Only sync OAuth users or if we're coming from OAuth callback
    if (!isOAuthCallback) {
      return;
    }

    // Sync user to database and redirect based on userType
    const syncUser = async () => {
      try {
        // Mark as syncing to prevent duplicate calls
        hasSyncedRef.current = true;

        const response = await fetch("/api/user/oauth-sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("OAuth sync error:", error);
          // Reset flag on error so we can retry
          hasSyncedRef.current = false;
          return;
        }

        const data = await response.json();
        if (data.success) {
          console.log("OAuth user synced successfully");

          // After sync, check user type and redirect accordingly
          try {
            const typeResponse = await fetch("/api/user/check-type");
            const typeData = await typeResponse.json();

            if (typeData.success) {
              // ADMIN: Redirect to admin dashboard
              if (typeData.userType === "ADMIN") {
                window.location.href = "/admin/dashboard";
              }
              // CUSTOMER: Redirect to root page
              else {
                window.location.href = "/";
              }
            }
          } catch (err) {
            console.error("Error redirecting after OAuth sync:", err);
            // Default to home on error
            window.location.href = "/";
          }
        }
      } catch (error) {
        console.error("Failed to sync OAuth user:", error);
        // Reset flag on error so we can retry
        hasSyncedRef.current = false;
      }
    };

    syncUser();
  }, [userLoaded, isSignedIn, user, sessionId, oauthCallback]);

  return null; // This component doesn't render anything
};

