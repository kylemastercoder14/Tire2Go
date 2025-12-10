"use client";

import React, { useEffect } from "react";
import { useSignUp, useSignIn, useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LoaderOne } from "@/components/globals/Loader";

/**
 * OAuth callback page for handling OAuth redirects during sign-up and sign-in
 * This page waits for Clerk to complete the OAuth flow and establish the session
 */
const SSOCallbackPage = () => {
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait for all auth states to load
    if (!authLoaded || (!signUpLoaded && !signInLoaded)) {
      return;
    }

    const handleOAuthCallback = async () => {
      try {
        // If user is already signed in, wait for sync then redirect
        if (isSignedIn && userLoaded && user) {
          // Give OAuthSyncHandler time to sync the user to database
          // Check if sync is in progress or completed
          let syncAttempts = 0;
          const maxAttempts = 10; // 5 seconds max wait

          while (syncAttempts < maxAttempts) {
            const synced = typeof window !== "undefined"
              ? sessionStorage.getItem(`oauth_synced_${user.id}`)
              : null;

            if (synced) {
              break; // Sync completed
            }

            await new Promise(resolve => setTimeout(resolve, 500));
            syncAttempts++;
          }

          router.replace("/");
          return;
        }

        // Try to handle as sign-up first
        if (signUpLoaded && signUp) {
          try {
            // Check the current sign-up status
            if (signUp.status === "complete") {
              // Sign-up is complete, set the session
              if (signUp.createdSessionId) {
                await setSignUpActive({ session: signUp.createdSessionId });
                // Wait for session to be established
                await new Promise(resolve => setTimeout(resolve, 1000));
                router.replace("/");
                return;
              }
            } else if (signUp.status === "missing_requirements") {
              // Missing some requirements, might need to complete profile
              router.replace("/complete-profile");
              return;
            }
          } catch (signUpError: any) {
            console.log("Sign-up OAuth handling:", signUpError);
          }
        }

        // Try to handle as sign-in
        if (signInLoaded && signIn) {
          try {
            // Check the current sign-in status
            if (signIn.status === "complete") {
              // Sign-in is complete, set the session
              if (signIn.createdSessionId) {
                await setSignInActive({ session: signIn.createdSessionId });
                // Wait for session to be established
                await new Promise(resolve => setTimeout(resolve, 1000));
                router.replace("/");
                return;
              }
            }
          } catch (signInError: any) {
            console.log("Sign-in OAuth handling:", signInError);
          }
        }

        // If neither worked, redirect to home (Clerk might have handled it)
        // or sign-in if no session
        setTimeout(() => {
          if (isSignedIn) {
            router.replace("/");
          } else {
            router.replace("/sign-in");
          }
        }, 2000);
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        router.replace("/sign-in");
      }
    };

    handleOAuthCallback();
  }, [
    authLoaded,
    signUpLoaded,
    signUp,
    signInLoaded,
    signIn,
    isSignedIn,
    userLoaded,
    user,
    router,
    setSignUpActive,
    setSignInActive,
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoaderOne />
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
};

export default SSOCallbackPage;

