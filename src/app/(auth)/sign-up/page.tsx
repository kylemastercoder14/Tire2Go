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

const Page = () => {
  const router = useRouter();
  const { isLoaded, signUp } = useSignUp();
  //  States for form inputs
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
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
    if (!signUp) return;

    await signUp.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: "/", // 👈 user will land here after auth
      redirectUrlComplete: "/", // 👈 final redirect after they finish
    });
  };

  return (
    <div className="min-h-screen flex w-full flex-col items-center bg-[#f5f5f5]">
      <div className="pt-50 max-w-3xl mx-auto w-full">
        <div className="bg-primary rounded-tl-md rounded-tr-md py-3 px-3 w-full">
          <h3 className="text-white w-full text-2xl font-bold tracking-tight">
            Create your new account
          </h3>
        </div>
        <div className="bg-white border shadow rounded-bl-md rounded-br-md py-3 px-3 w-full">
          <form
            onSubmit={handleSubmit}
            className="mt-2 flex flex-col space-y-4 w-full"
          >
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  type="text"
                  placeholder="Enter first name"
                  value={firstName}
                  required
                  disabled={!isLoaded || isLoading}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  type="text"
                  placeholder="Enter last name"
                  value={lastName}
                  required
                  disabled={!isLoaded || isLoading}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                required
                disabled={!isLoaded || isLoading}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                required
                disabled={!isLoaded || isLoading}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                required
                disabled={!isLoaded || isLoading}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <div className="flex gap-2">
                <div className="w-20 flex-shrink-0">
                  <Input
                    type="text"
                    value={countryCode}
                    disabled
                    className="bg-gray-100 text-center font-medium"
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
                  className="flex-1"
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
              className="w-full"
            >
              Sign Up
            </Button>
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                Or continue with
              </span>
            </div>
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
              <Button
                type="button"
                disabled={isLoading || !isLoaded}
                variant="outline"
                onClick={() => handleOAuth("oauth_google")}
                className="w-full"
              >
                <div className="relative size-5">
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
                className="w-full"
              >
                <div className="relative size-5">
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
            <p className="text-center mx-auto">
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
