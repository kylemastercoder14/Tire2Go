/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSignUp } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const Page = () => {
  const router = useRouter();
  const { isLoaded, signUp } = useSignUp();
  //  States for form inputs
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Country code for Philippines
  const countryCode = "+63";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isLoaded) return;
    setIsLoading(true);

    try {
      // 1. Create the user
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // 2. Save to your DB
      // Combine country code and mobile number
      const fullMobileNumber = `${countryCode}${mobileNumber}`;

      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          mobileNumber: fullMobileNumber,
        }),
      });

      // 3. Trigger captcha + email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // 3. Only after captcha passes and code is sent → move to verify page
      toast.success("Verification email sent. Please check your inbox.");
      router.push(`/verify-email/${email}`);
    } catch (err: any) {
      console.error("Sign up error:", err);
      toast.error(
        err.errors?.[0]?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "oauth_google" | "oauth_facebook") => {
    if (!signUp || !isLoaded) return;

    try {
      // Store in sessionStorage that we're starting OAuth sign-up
      if (typeof window !== "undefined") {
        sessionStorage.setItem("oauth_signup_in_progress", "true");
      }

      // For sign-up, Clerk will handle the OAuth flow
      // redirectUrl is where Clerk redirects during the flow
      // redirectUrlComplete is where Clerk redirects after sign-up is complete
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback", // Intermediate callback page to handle completion
        redirectUrlComplete: "/", // Final redirect after everything is complete
      });
    } catch (error: any) {
      console.error("OAuth error:", error);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("oauth_signup_in_progress");
      }
      toast.error("Failed to authenticate with Google. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex w-full flex-col items-center bg-[#f5f5f5] pt-20 sm:pt-24 lg:pt-32 pb-8 sm:pb-10">
      <div className="px-4 sm:px-6 max-w-3xl mx-auto w-full">
        <div className="bg-primary rounded-tl-md rounded-tr-md py-3 sm:py-4 px-4 sm:px-6 w-full">
          <h3 className="text-white w-full text-xl sm:text-2xl font-bold tracking-tight">
            Create your new account
          </h3>
        </div>
        <div className="bg-white border shadow rounded-bl-md rounded-br-md py-4 sm:py-6 px-4 sm:px-6 w-full">
          <form
            onSubmit={handleSubmit}
            className="mt-2 flex flex-col space-y-4 w-full"
          >
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">First Name</Label>
                <Input
                  type="text"
                  placeholder="Enter first name"
                  value={firstName}
                  required
                  disabled={!isLoaded || isLoading}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Last Name</Label>
                <Input
                  type="text"
                  placeholder="Enter last name"
                  value={lastName}
                  required
                  disabled={!isLoaded || isLoading}
                  onChange={(e) => setLastName(e.target.value)}
                  className="text-sm sm:text-base"
                />
              </div>
            </div>
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
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  required
                  disabled={!isLoaded || isLoading}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10 text-sm sm:text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={!isLoaded || isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Mobile Number</Label>
              <div className="flex gap-2">
                <div className="w-16 sm:w-20 flex-shrink-0">
                  <Input
                    type="text"
                    value={countryCode}
                    disabled
                    className="bg-gray-100 text-center font-medium text-xs sm:text-sm"
                    readOnly
                  />
                </div>
                <Input
                  type="tel"
                  placeholder="9152479693"
                  value={mobileNumber}
                  required
                  disabled={!isLoaded || isLoading}
                  maxLength={10}
                  onChange={(e) => {
                    // Only allow digits and limit to 10 characters
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setMobileNumber(value);
                  }}
                  className="flex-1 text-sm sm:text-base"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter 10 digits (e.g., 9152479693)
              </p>
            </div>
            {/* <div id="clerk-captcha"></div> */}
            <Button
              disabled={!isLoaded || isLoading}
              type="submit"
              className="w-full text-sm sm:text-base"
            >
              Sign Up
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
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-primary font-medium underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
