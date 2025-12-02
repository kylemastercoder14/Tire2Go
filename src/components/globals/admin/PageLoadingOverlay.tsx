"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

export function PageLoadingOverlay() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Show loader for at least 300ms to prevent flickering

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
        <Loader className="size-8 text-primary animate-spin" />
        <p className="text-lg font-medium text-gray-700">Loading page...</p>
      </div>
    </div>
  );
}
