"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";

export function PageLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const pathnameRef = useRef(pathname);
  const searchParamsRef = useRef(searchParams.toString());
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing timeout
  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  // Track pathname changes (navigation between pages)
  useEffect(() => {
    if (pathname !== pathnameRef.current) {
      pathnameRef.current = pathname;
      clearLoadingTimeout();
      setIsLoading(true);
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        loadingTimeoutRef.current = null;
      }, 2000); // Show loader for at least 600ms for page navigation

      return () => clearLoadingTimeout();
    }
  }, [pathname]);

  // Track search params changes (filtering, sorting, etc.)
  useEffect(() => {
    const currentParams = searchParams.toString();
    if (currentParams !== searchParamsRef.current) {
      const prevParams = new URLSearchParams(searchParamsRef.current);
      const newParams = new URLSearchParams(currentParams);

      // Check if sortBy changed (requires server-side processing)
      const sortByChanged = prevParams.get('sortBy') !== newParams.get('sortBy');

      searchParamsRef.current = currentParams;
      clearLoadingTimeout();
      setIsLoading(true);

      // Wait for page content to actually update
      // For sortBy changes, wait longer since it requires server-side sorting
      const waitTime = sortByChanged ? 1500 : 800;

      // Try to detect when content actually updates by watching for product grid changes
      let contentCheckInterval: NodeJS.Timeout | null = null;
      let checkCount = 0;
      const maxChecks = 50; // Max 5 seconds of checking (50 * 100ms)

      if (sortByChanged) {
        // For sorting, wait for the product grid to update
        contentCheckInterval = setInterval(() => {
          checkCount++;

          // Check if product grid has loaded (look for product cards or skeleton loaders)
          const productCards = document.querySelectorAll('[data-product-card]');
          const skeletonLoaders = document.querySelectorAll('[data-skeleton]');

          // If we see product cards (not skeletons), content has loaded
          // Also check that cards have actual content (images loaded or text present)
          const hasContent = productCards.length > 0 &&
            Array.from(productCards).some(card => {
              const img = card.querySelector('img');
              const text = card.textContent?.trim();
              return (img && img.complete) || (text && text.length > 0);
            });

          if (hasContent && skeletonLoaders.length === 0) {
            clearInterval(contentCheckInterval!);
            clearLoadingTimeout();
            setIsLoading(false);
          } else if (checkCount >= maxChecks) {
            // Timeout after max checks
            clearInterval(contentCheckInterval!);
          }
        }, 100);
      }

      loadingTimeoutRef.current = setTimeout(() => {
        if (contentCheckInterval) {
          clearInterval(contentCheckInterval);
        }
        setIsLoading(false);
        loadingTimeoutRef.current = null;
      }, waitTime);

      return () => {
        clearLoadingTimeout();
        if (contentCheckInterval) {
          clearInterval(contentCheckInterval);
        }
      };
    }
  }, [searchParams]);

  // Listen for link clicks and button interactions
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if clicking a link
      const link = target.closest('a[href]');
      if (link) {
        const href = (link as HTMLAnchorElement).href;
        const currentOrigin = window.location.origin;

        // Only show loading for internal links that aren't anchors or external
        if (href.startsWith(currentOrigin) &&
            !href.includes('#') &&
            !href.includes('javascript:') &&
            href !== window.location.href) {
          clearLoadingTimeout();
          setIsLoading(true);
          loadingTimeoutRef.current = setTimeout(() => {
            setIsLoading(false);
            loadingTimeoutRef.current = null;
          }, 300);
        }
      }

      // Check if clicking a button that might trigger navigation or form submission
      const button = target.closest('button[type="submit"], button[data-navigate], button[aria-label*="navigate"], button[aria-label*="redirect"]');
      if (button && !button.hasAttribute('disabled')) {
        clearLoadingTimeout();
        setIsLoading(true);
        loadingTimeoutRef.current = setTimeout(() => {
          setIsLoading(false);
          loadingTimeoutRef.current = null;
        }, 300);
      }
    };

    // Add event listener with capture to catch events early
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      clearLoadingTimeout();
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 flex flex-col items-center gap-4 shadow-xl animate-in zoom-in-95 duration-200">
        <Loader2 className="size-6 sm:size-8 text-primary animate-spin" />
        <p className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200">Loading...</p>
      </div>
    </div>
  );
}

