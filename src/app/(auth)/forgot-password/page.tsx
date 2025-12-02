/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const { isLoaded, signIn } = useSignIn();
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setIsLoading(true);

    try {
      // Create a password reset attempt
      const signInAttempt = await signIn.create({
        identifier: email,
      });

      // Get supported first factors from the sign-in attempt
      const supportedFirstFactors = signInAttempt.supportedFirstFactors || signIn.supportedFirstFactors || [];

      // Find the email address ID from the supported factors
      // Look for reset_password_email_code strategy first, then fall back to email_code
      let emailFactor = supportedFirstFactors.find(
        (factor: any) => factor.strategy === "reset_password_email_code"
      );

      // If not found, try to find email_code strategy
      if (!emailFactor) {
        emailFactor = supportedFirstFactors.find(
          (factor: any) =>
            factor.strategy === "email_code" ||
            (factor.safeIdentifier && factor.safeIdentifier.toLowerCase() === email.toLowerCase())
        );
      }

      // Type guard: check if factor has emailAddressId property
      if (!emailFactor || !('emailAddressId' in emailFactor) || !emailFactor.emailAddressId) {
        throw new Error("Email address not found. Please check your email and try again.");
      }

      // Get the email address ID from the factor
      const emailAddressId = (emailFactor as any).emailAddressId;

      // Prepare password reset email code with the email address ID
      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: emailAddressId,
      });

      toast.success("Password reset code sent! Please check your inbox.");
      // Redirect to reset password page to enter code
      router.push(`/reset-password/${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error("Password reset error:", err);
      toast.error(
        err.errors?.[0]?.message || err.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex w-full flex-col items-center bg-[#f5f5f5]">
      <div className="pt-50 max-w-3xl mx-auto w-full">
        <div className="bg-primary rounded-tl-md rounded-tr-md py-3 px-3 w-full">
          <h3 className="text-white w-full text-2xl font-bold tracking-tight">
            Reset your password
          </h3>
        </div>
        <div className="bg-white border shadow rounded-bl-md rounded-br-md py-3 px-3 w-full">
          <form
            onSubmit={handleSubmit}
            className="mt-2 flex flex-col space-y-4 w-full"
          >
            <p className="text-sm text-muted-foreground">
              Enter your email address and we&apos;ll send you a code to reset
              your password.
            </p>
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
            <Button
              disabled={!isLoaded || isLoading}
              type="submit"
              className="w-full"
            >
              {isLoading ? "Sending..." : "Send Reset Code"}
            </Button>
            <p className="text-center mx-auto">
              Remember your password?{" "}
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
