"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function useCheckProfile() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return; // wait for Clerk to load

    const checkProfile = async () => {
      try {
        if (!user) {
          router.replace("/");
          return;
        }

        // Call your API to check if user exists in DB
        const res = await fetch("/api/user/check-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authId: user.id }),
        });

        const data = await res.json();

        if (!data.exists) {
          router.replace("/complete-profile");
        }
      } catch (err) {
        console.error("Profile check error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [isLoaded, user, router]);

  return { loading };
}
