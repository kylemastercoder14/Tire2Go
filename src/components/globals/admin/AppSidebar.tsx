"use client";

import * as React from "react";
import {
  IconBadgeTm,
  IconBox,
  IconCar,
  IconCircleDotFilled,
  IconDashboard,
  IconDatabase,
  IconFileText,
  IconHelpCircle,
  IconMessageCircle,
  IconScale,
  IconSitemap,
  IconTag,
  IconUserCog,
  IconUsersGroup,
  IconWallet,
  IconWheel,
  IconZoomQuestion,
} from "@tabler/icons-react";

import { NavMain } from "@/components/globals/admin/NavMain";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navMainData = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Brands",
    url: "/admin/brands",
    icon: IconBadgeTm,
  },
  {
    title: "Product Catalog",
    url: "/admin/products",
    icon: IconSitemap,
  },
  {
    title: "Car Management",
    url: "/admin/car-management",
    icon: IconCar,
  },
  {
    title: "Tire Sizes",
    url: "/admin/tire-sizes",
    icon: IconWheel,
  },
  {
    title: "Inventory Management",
    url: "/admin/inventory-management",
    icon: IconBox,
  },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: IconUsersGroup,
  },
  // {
  //   title: "Staff Management",
  //   url: "/admin/staff-management",
  //   icon: IconUserCog,
  // },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: IconWallet,
  },
  {
    title: "Promotion & Discounts",
    url: "/admin/promotions-and-discounts",
    icon: IconTag,
  },
  {
    title: "Tips & Guides",
    url: "/admin/tips-and-guides",
    icon: IconHelpCircle,
  },
  {
    title: "Feedback",
    url: "/admin/feedback",
    icon: IconFileText,
  },
  {
    title: "FAQs",
    url: "/admin/faqs",
    icon: IconZoomQuestion,
  },
  {
    title: "Policies",
    url: "/admin/policies",
    icon: IconScale,
  },
  {
    title: "Backup & Recovery",
    url: "/admin/backup-recovery",
    icon: IconDatabase,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/admin/dashboard" className="flex items-center gap-2">
                {/* <Image src="/logo.png" alt="Tyre2Go" width={70} height={70} /> */}
                <IconCircleDotFilled className="!size-5" />
                <span className="text-base font-semibold">
                  Tyre2Go Admin Panel
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
