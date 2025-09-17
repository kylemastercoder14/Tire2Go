"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getPageTitle } from "@/lib/utils";

// Your navMain config
const navMain = [
  { title: "Dashboard", url: "/admin/dashboard" },
  { title: "Brands", url: "/admin/brands" },
  { title: "Product Catalog", url: "/admin/products" },
  { title: "Inventory Management", url: "/admin/inventory-management" },
  { title: "Customers", url: "/admin/customers" },
  { title: "Orders", url: "/admin/orders" },
  { title: "Promotion & Discounts", url: "/admin/promotions-and-discounts" },
  { title: "Feedback & Inquiries", url: "/admin/feedback-and-inquiries" },
  { title: "Settings", url: "/admin/settings" },
  { title: "Tips & Guides", url: "/admin/tips-and-guides" },
  { title: "FAQs", url: "/admin/faqs" },
  { title: "Policies", url: "/admin/policies" },
  { title: "Staff Management", url: "/admin/staff-management" },
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
        <h1 className="text-base font-medium">{currentPage}</h1>
        <div className="ml-auto lg:flex hidden items-center gap-2">
          <h1 className="text-base">{currentDateTime}</h1>
        </div>
      </div>
    </header>
  );
}
