/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const Page = () => {
  const router = useRouter();
  const { isLoaded, setActive, signIn } = useSignIn();
  //  States for form inputs
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user based on their userType
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })

        // Wait a moment for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 300));

        // Check user type and redirect accordingly
        try {
          const response = await fetch('/api/user/check-type');

          if (!response.ok) {
            console.error("Failed to check user type:", response.statusText);
            router.replace('/');
            return;
          }

          const data = await response.json();

          if (data.success && data.userType) {
            // ADMIN: Redirect to admin dashboard
            if (data.userType === 'ADMIN') {
              router.replace('/admin/dashboard');
            }
            // CUSTOMER: Redirect to root page
            else {
              router.replace('/');
            }
          } else {
            // Default to home if check fails
            router.replace('/');
          }
        } catch (err) {
          console.error("Error checking user type:", err);
          // Default to home if check fails
          router.replace('/');
        }
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
        toast.error("Sign in not complete. Please try again.")
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      toast.error(
        err.errors?.[0]?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "oauth_google" | "oauth_facebook") => {
    if (!signIn) return;

    await signIn.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: "/", // 👈 user will land here after auth
      redirectUrlComplete: "/", // 👈 final redirect after they finish
    });
  };

  return (
    <div className="min-h-screen flex w-full flex-col items-center bg-[#f5f5f5] pt-20 sm:pt-24 lg:pt-32 pb-8 sm:pb-10">
      <div className="px-4 sm:px-6 max-w-3xl mx-auto w-full">
        <div className="bg-primary rounded-tl-md rounded-tr-md py-3 sm:py-4 px-4 sm:px-6 w-full">
          <h3 className="text-white w-full text-xl sm:text-2xl font-bold tracking-tight">
            Login to your account
          </h3>
        </div>
        <div className="bg-white border shadow rounded-bl-md rounded-br-md py-4 sm:py-6 px-4 sm:px-6 w-full">
          <form
            onSubmit={handleSubmit}
            className="mt-2 flex flex-col space-y-4 w-full"
          >
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Email Address</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                required
                disabled={!isLoaded || isLoading}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  required
                  disabled={!isLoaded || isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 text-sm sm:text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={!isLoaded || isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Link
              href="/forgot-password"
              className="text-primary font-medium underline ml-auto text-xs sm:text-sm"
            >
              Forgot password?
            </Link>
            {/* <div id="clerk-captcha"></div> */}
            <Button
              disabled={!isLoaded || isLoading}
              type="submit"
              className="w-full text-sm sm:text-base"
            >
              Sign In
            </Button>
            <div className="after:border-border relative text-center text-xs sm:text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                Or continue with
              </span>
            </div>
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-3 sm:gap-4">
              <Button
                type="button"
                disabled={isLoading || !isLoaded}
                variant="outline"
                onClick={() => handleOAuth("oauth_google")}
                className="w-full text-xs sm:text-sm"
              >
                <div className="relative size-4 sm:size-5">
                  <Image
                    src="https://images.clerk.dev/static/google.svg"
                    alt="Google"
                    fill
                    className="size-full object-contain"
                  />
                </div>
                Continue with Google
              </Button>
              <Button
                type="button"
                disabled={isLoading || !isLoaded}
                variant="outline"
                onClick={() => handleOAuth("oauth_facebook")}
                className="w-full text-xs sm:text-sm"
              >
                <div className="relative size-4 sm:size-5">
                  <Image
                    src="https://images.clerk.dev/static/facebook.svg"
                    alt="Facebook"
                    fill
                    className="size-full object-contain"
                  />
                </div>
                Continue with Facebook
              </Button>
            </div>
            <p className="text-center mx-auto text-xs sm:text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="text-primary font-medium underline"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
