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
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          mobileNumber,
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
              <Label>Mobile Number</Label>
              <Input
                type="tel"
                placeholder="Enter mobile number"
                value={mobileNumber}
                required
                disabled={!isLoaded || isLoading}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
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
