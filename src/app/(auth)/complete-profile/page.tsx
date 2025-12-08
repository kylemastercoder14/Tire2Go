/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const CompleteProfile = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(
    user?.emailAddresses[0]?.emailAddress || ""
  );
  const [password, setPassword] = useState(""); // optional if you want a local pw
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) throw new Error("No user found");

      // update in Clerk
      await user.update({
        firstName,
        lastName,
      });

      // save in your DB
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.primaryEmailAddress?.emailAddress,
          password, // optional
          firstName,
          lastName,
          mobileNumber,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Failed to save profile");
      }

      await fetch("/api/user/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          authId: user.id,
        }), // or Clerk userId
      });

      toast.success("Profile completed!");

      // Clear profile check flag so the hook can verify profile exists on next check
      try {
        if (typeof window !== "undefined" && user) {
          sessionStorage.removeItem(`profile_checked_${user.id}`);
        }
      } catch {
        // Ignore sessionStorage errors
      }

      // Check user type and redirect accordingly
      try {
        const typeResponse = await fetch("/api/user/check-type");
        const typeData = await typeResponse.json();

        if (typeData.success) {
          // ADMIN: Redirect to admin dashboard
          if (typeData.userType === "ADMIN") {
            router.replace("/admin/dashboard");
          }
          // CUSTOMER: Redirect to root page
          else {
            router.replace("/");
          }
        } else {
          router.replace("/");
        }
      } catch (err) {
        console.error("Error checking user type:", err);
        router.replace("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full flex-col items-center bg-[#f5f5f5] pt-20 sm:pt-24 lg:pt-32 pb-8 sm:pb-10">
      <div className="px-4 sm:px-6 max-w-3xl mx-auto w-full">
        <div className="bg-primary rounded-tl-md rounded-tr-md py-3 sm:py-4 px-4 sm:px-6 w-full">
          <h3 className="text-white w-full text-xl sm:text-2xl font-bold tracking-tight">
            Complete your profile
          </h3>
        </div>
        <div className="bg-white border shadow rounded-bl-md rounded-br-md py-4 sm:py-6 px-4 sm:px-6 w-full">
          <form
            onSubmit={handleSave}
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
                  disabled={!isLoaded || loading}
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
                  disabled={!isLoaded || loading}
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
                disabled={!isLoaded || loading}
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
                  disabled={!isLoaded || loading}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 text-sm sm:text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={!isLoaded || loading}
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
              <Label className="text-sm sm:text-base">Mobile Number</Label>
              <Input
                type="tel"
                placeholder="Enter mobile number"
                value={mobileNumber}
                required
                disabled={!isLoaded || loading}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="text-sm sm:text-base"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full text-sm sm:text-base">
              Save & Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
