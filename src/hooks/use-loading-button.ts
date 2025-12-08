"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook to add loading state to buttons that trigger navigation or async actions
 */
export function useLoadingButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNavigation = (url: string, callback?: () => void) => {
    setIsLoading(true);
    router.push(url);

    // Hide loading after navigation starts (Next.js handles the rest)
    setTimeout(() => {
      setIsLoading(false);
      if (callback) callback();
    }, 300);
  };

  const handleAction = async (action: () => Promise<void> | void) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      // Keep loading state for a minimum time to prevent flickering
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  return {
    isLoading,
    handleNavigation,
    handleAction,
    setIsLoading,
  };
}

