/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import Link from "next/link";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const { email } = params as { email: string };
  const formattedEmail = decodeURIComponent(email);
  const { isLoaded, signIn, setActive } = useSignIn();
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [timer, setTimer] = React.useState(60);

  React.useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  // Initialize sign-in attempt and prepare first factor when component mounts
  React.useEffect(() => {
    const initializeSignIn = async () => {
      if (!isLoaded || !signIn) return;

      try {
        // Always create a fresh sign-in attempt for password reset
        const signInAttempt = await signIn.create({
          identifier: formattedEmail,
        });

        // Get supported first factors from the sign-in attempt
        const supportedFirstFactors =
          signInAttempt.supportedFirstFactors ||
          signIn.supportedFirstFactors ||
          [];

        // Find the email address ID
        let emailFactor = supportedFirstFactors.find(
          (factor: any) => factor.strategy === "reset_password_email_code"
        );

        if (!emailFactor) {
          emailFactor = supportedFirstFactors.find(
            (factor: any) =>
              factor.strategy === "email_code" ||
              (factor.safeIdentifier &&
                factor.safeIdentifier.toLowerCase() === formattedEmail.toLowerCase())
          );
        }

        // Type guard: check if factor has emailAddressId property
        if (emailFactor && 'emailAddressId' in emailFactor && (emailFactor as any).emailAddressId) {
          // Prepare the password reset email code
          await signIn.prepareFirstFactor({
            strategy: "reset_password_email_code",
            emailAddressId: (emailFactor as any).emailAddressId,
          });
        }
      } catch (err: any) {
        // If sign-in attempt already exists, try to prepare first factor
        if (err.errors?.[0]?.code === "form_identifier_exists") {
          try {
            const supportedFirstFactors = signIn.supportedFirstFactors || [];
            let emailFactor = supportedFirstFactors.find(
              (factor: any) => factor.strategy === "reset_password_email_code"
            );

            if (!emailFactor) {
              emailFactor = supportedFirstFactors.find(
                (factor: any) =>
                  factor.strategy === "email_code" ||
                  (factor.safeIdentifier &&
                    factor.safeIdentifier.toLowerCase() === formattedEmail.toLowerCase())
              );
            }

            // Type guard: check if factor has emailAddressId property
            if (emailFactor && 'emailAddressId' in emailFactor && (emailFactor as any).emailAddressId) {
              await signIn.prepareFirstFactor({
                strategy: "reset_password_email_code",
                emailAddressId: (emailFactor as any).emailAddressId,
              });
            }
          } catch (prepareErr) {
            console.log("Error preparing first factor:", prepareErr);
          }
        } else {
          console.log("Error initializing sign-in:", err);
        }
      }
    };

    initializeSignIn();
  }, [isLoaded, signIn, formattedEmail]);

  // robust onChange handler in case the InputOTP emits string or event
  const handleOtpChange = (val: any) => {
    if (typeof val === "string") {
      setCode(val);
    } else if (val && typeof val === "object") {
      // handle synthetic event or other shapes
      const v = (val.target && val.target.value) || val.value || "";
      setCode(String(v));
    } else {
      setCode("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      // Ensure sign-in attempt exists and first factor is prepared
      let currentSignIn = signIn;

      // If status is null, create the sign-in attempt
      if (currentSignIn.status === null) {
        const signInAttempt = await currentSignIn.create({
          identifier: formattedEmail,
        });

        // Get supported first factors
        const supportedFirstFactors =
          signInAttempt.supportedFirstFactors || currentSignIn.supportedFirstFactors || [];

        let emailFactor = supportedFirstFactors.find(
          (factor: any) => factor.strategy === "reset_password_email_code"
        );

        if (!emailFactor) {
          emailFactor = supportedFirstFactors.find(
            (factor: any) =>
              factor.strategy === "email_code" ||
              (factor.safeIdentifier &&
                factor.safeIdentifier.toLowerCase() === formattedEmail.toLowerCase())
          );
        }

        // Type guard: check if factor has emailAddressId property
        if (!emailFactor || !('emailAddressId' in emailFactor) || !(emailFactor as any).emailAddressId) {
          throw new Error("Could not prepare password reset. Please try again.");
        }

        // Prepare the first factor
        await currentSignIn.prepareFirstFactor({
          strategy: "reset_password_email_code",
          emailAddressId: (emailFactor as any).emailAddressId,
        });
      } else if (currentSignIn.status !== "needs_first_factor") {
        // If status is not needs_first_factor, we might need to prepare it
        const supportedFirstFactors = currentSignIn.supportedFirstFactors || [];
        let emailFactor = supportedFirstFactors.find(
          (factor: any) => factor.strategy === "reset_password_email_code"
        );

        if (!emailFactor) {
          emailFactor = supportedFirstFactors.find(
            (factor: any) =>
              factor.strategy === "email_code" ||
              (factor.safeIdentifier &&
                factor.safeIdentifier.toLowerCase() === formattedEmail.toLowerCase())
          );
        }

        // Type guard: check if factor has emailAddressId property
        if (emailFactor && 'emailAddressId' in emailFactor && (emailFactor as any).emailAddressId) {
          await currentSignIn.prepareFirstFactor({
            strategy: "reset_password_email_code",
            emailAddressId: (emailFactor as any).emailAddressId,
          });
        }
      }

      // Attempt to verify the code
      const signInAttempt = await currentSignIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      // If reset was completed, set the session as active and redirect
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        toast.success("Password reset successful!");
        router.replace("/sign-in");
      } else {
        // If the status is not complete, check why
        console.error(JSON.stringify(signInAttempt, null, 2));
        toast.error("Password reset not complete. Please try again.");
      }
    } catch (err: any) {
      console.error("Password reset error:", err);

      const message =
        err.errors?.[0]?.message || // Clerk API style
        err.message || // JS error message
        "Something went wrong. Please try again.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || !signIn) return;
    setIsLoading(true);

    try {
      // Recreate the sign-in attempt
      const signInAttempt = await signIn.create({
        identifier: formattedEmail,
      });

      // Get supported first factors
      const supportedFirstFactors =
        signInAttempt.supportedFirstFactors ||
        signIn.supportedFirstFactors ||
        [];

      // Find the email address ID
      let emailFactor = supportedFirstFactors.find(
        (factor: any) => factor.strategy === "reset_password_email_code"
      );

      if (!emailFactor) {
        emailFactor = supportedFirstFactors.find(
          (factor: any) =>
            factor.strategy === "email_code" ||
            (factor.safeIdentifier &&
              factor.safeIdentifier.toLowerCase() === formattedEmail.toLowerCase())
        );
      }

      // Type guard: check if factor has emailAddressId property
      if (!emailFactor || !('emailAddressId' in emailFactor) || !(emailFactor as any).emailAddressId) {
        throw new Error("Email address not found");
      }

      // Resend the code
      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: (emailFactor as any).emailAddressId,
      });

      toast.success("Reset code resent successfully!");
      setTimer(60);
    } catch (err: any) {
      console.error("Resend error:", err);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full flex-col items-center bg-[#f5f5f5]">
      <div className="pt-50 max-w-3xl mx-auto w-full">
        <div className="bg-primary rounded-tl-md rounded-tr-md py-3 px-3 w-full">
          <h3 className="text-white w-full text-2xl font-bold tracking-tight">
            Reset password code
          </h3>
        </div>
        <div className="bg-white border shadow rounded-bl-md rounded-br-md py-3 px-3 w-full">
          <form
            onSubmit={handleSubmit}
            className="mt-2 flex flex-col space-y-4 w-full"
          >
            <p className="text-sm text-muted-foreground">
              Enter the code sent to{" "}
              <span className="font-medium text-foreground">{formattedEmail}</span>{" "}
              and your new password.
            </p>

            <div className="space-y-2">
              <Label className="block text-center">Reset Code</Label>
              <div className="w-full flex justify-center">
                <InputOTP
                  value={code}
                  onChange={handleOtpChange}
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  className="w-fit inline-flex items-center justify-center gap-3"
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="size-12 mx-1 text-center rounded-md border"
                    />
                    <InputOTPSlot
                      index={1}
                      className="size-12 mx-1 text-center rounded-md border"
                    />
                  </InputOTPGroup>

                  <InputOTPSeparator />

                  <InputOTPGroup>
                    <InputOTPSlot
                      index={2}
                      className="size-12 mx-1 text-center rounded-md border"
                    />
                    <InputOTPSlot
                      index={3}
                      className="size-12 mx-1 text-center rounded-md border"
                    />
                  </InputOTPGroup>

                  <InputOTPSeparator />

                  <InputOTPGroup>
                    <InputOTPSlot
                      index={4}
                      className="size-12 mx-1 text-center rounded-md border"
                    />
                    <InputOTPSlot
                      index={5}
                      className="size-12 mx-1 text-center rounded-md border"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={password}
                required
                disabled={!isLoaded || isLoading}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                required
                disabled={!isLoaded || isLoading}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
              />
            </div>

            <Button
              disabled={!isLoaded || isLoading || code.length !== 6}
              type="submit"
              className="w-full"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>

            <p className="text-center text-sm">
              Didn&apos;t receive the code?{" "}
              {timer > 0 ? (
                <span className="text-gray-500">Resend in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading || !isLoaded}
                  className="text-primary font-medium underline disabled:opacity-50"
                >
                  Resend Code
                </button>
              )}
            </p>

            <p className="text-center mx-auto">
              <Link
                href="/sign-in"
                className="text-primary font-medium underline"
              >
                Back to Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;

