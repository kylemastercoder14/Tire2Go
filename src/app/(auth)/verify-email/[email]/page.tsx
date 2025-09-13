/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSignUp } from "@clerk/nextjs";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const { email } = params as { email: string };
  const formattedEmail = decodeURIComponent(email);
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [timer, setTimer] = React.useState(60);

  React.useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

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
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });
      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        // ✅ mark user verified in DB
        await fetch("/api/user/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formattedEmail, authId: signUpAttempt.createdUserId }), // or Clerk userId
        });
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      console.error("Verification error (raw):", err);

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
    if (!isLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success("OTP resent successfully!");
      setTimer(60);
    } catch (err) {
      console.log(err);
      toast.error("Failed to resend OTP. Please try again.");
    }
  };
  return (
    <div className="min-h-screen flex w-full flex-col items-center bg-[#f5f5f5]">
      <div className="pt-50 max-w-3xl mx-auto w-full">
        <div className="bg-primary rounded-tl-md rounded-tr-md py-3 px-3 w-full">
          <h3 className="text-white w-full text-2xl font-bold tracking-tight">
            Complete your email verification
          </h3>
        </div>
        <div className="bg-white border shadow rounded-bl-md rounded-br-md py-3 px-3 w-full">
          <form
            onSubmit={handleSubmit}
            className="mt-2 flex flex-col space-y-6 w-full items-center"
          >
            <div className="space-y-3 w-full">
              <Label className="block text-center">OTP Code</Label>

              {/* CENTERING WRAPPER */}
              <div className="w-full flex justify-center">
                {/* make InputOTP shrink to content with w-fit/inline-flex */}
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
                      className="size-20 mx-2 text-center rounded-md border"
                    />
                    <InputOTPSlot
                      index={1}
                      className="size-20 mx-2 text-center rounded-md border"
                    />
                  </InputOTPGroup>

                  <InputOTPSeparator />

                  <InputOTPGroup>
                    <InputOTPSlot
                      index={2}
                      className="size-20 mx-2 text-center rounded-md border"
                    />
                    <InputOTPSlot
                      index={3}
                      className="size-20 mx-2 text-center rounded-md border"
                    />
                  </InputOTPGroup>

                  <InputOTPSeparator />

                  <InputOTPGroup>
                    <InputOTPSlot
                      index={4}
                      className="size-20 mx-2 text-center rounded-md border"
                    />
                    <InputOTPSlot
                      index={5}
                      className="size-20 mx-2 text-center rounded-md border"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <Button
              disabled={!isLoaded || isLoading}
              type="submit"
              className="w-full"
            >
              Verify Email
            </Button>
            <p className="text-center text-sm">
              Didn&apos;t receive the code?{" "}
              {timer > 0 ? (
                <span className="text-gray-500">Resend in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-primary font-medium underline"
                >
                  Resend OTP
                </button>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
