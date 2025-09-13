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

const Page = () => {
  const router = useRouter();
  const { isLoaded, setActive, signIn } = useSignIn();
  //  States for form inputs
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
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
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
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
    <div className="min-h-screen flex w-full flex-col items-center bg-[#f5f5f5]">
      <div className="pt-50 max-w-3xl mx-auto w-full">
        <div className="bg-primary rounded-tl-md rounded-tr-md py-3 px-3 w-full">
          <h3 className="text-white w-full text-2xl font-bold tracking-tight">
            Login to your account
          </h3>
        </div>
        <div className="bg-white border shadow rounded-bl-md rounded-br-md py-3 px-3 w-full">
          <form
            onSubmit={handleSubmit}
            className="mt-2 flex flex-col space-y-4 w-full"
          >
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
            <Link
              href="/forgot-password"
              className="text-primary font-medium underline ml-auto"
            >
              Forgot password?
            </Link>
            {/* <div id="clerk-captcha"></div> */}
            <Button
              disabled={!isLoaded || isLoading}
              type="submit"
              className="w-full"
            >
              Sign In
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
