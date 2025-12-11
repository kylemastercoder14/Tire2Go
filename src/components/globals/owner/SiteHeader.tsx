"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getPageTitle } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

// Your navMain config
const navMain = [
  { title: "Dashboard", url: "/owner/dashboard" },
  { title: "Brands", url: "/owner/brands" },
  { title: "Product Catalog", url: "/owner/products" },
  { title: "Inventory Management", url: "/owner/inventory-management" },
  { title: "Customers", url: "/owner/customers" },
  { title: "Orders", url: "/owner/orders" },
  { title: "Promotion & Discounts", url: "/owner/promotions-and-discounts" },
  { title: "Feedback", url: "/owner/feedback" },
  { title: "Inquiries", url: "/owner/inquiries" },
  { title: "Settings", url: "/owner/settings" },
  { title: "Tips & Guides", url: "/owner/tips-and-guides" },
  { title: "FAQs", url: "/owner/faqs" },
  { title: "Policies", url: "/owner/policies" },
  { title: "Staff Management", url: "/owner/staff-management" },
  { title: "Backup & Restore", url: "/owner/backup-recovery" },
  { title: "Car Management", url: "/owner/car-management" },
];

export function SiteHeader() {
  const [currentDateTime, setCurrentDateTime] = useState("");
  const pathname = usePathname();

  const currentPage = getPageTitle(pathname, navMain);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const formattedDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Manila",
      });
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Manila",
      });

      const gmtOffset = "GMT+8 PH Time";
      setCurrentDateTime(`${formattedDate} - ${formattedTime} (${gmtOffset})`);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-sm sm:text-base font-medium truncate max-w-[200px] sm:max-w-none">
          {currentPage}
        </h1>
        <div className="ml-auto flex items-center gap-2 lg:gap-3">
          <h1 className="text-sm sm:text-base hidden sm:block">
            {currentDateTime}
          </h1>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 sm:h-9 sm:w-9",
                userButtonPopoverCard: "shadow-lg",
                userButtonPopoverActions: "p-2",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
