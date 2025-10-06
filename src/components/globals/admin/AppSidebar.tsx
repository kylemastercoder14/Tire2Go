"use client";

import * as React from "react";
import {
  IconBadgeTm,
  IconBox,
  IconCircleDotFilled,
  IconDashboard,
  IconFileText,
  IconHelpCircle,
  IconScale,
  IconTag,
  IconUserCog,
  IconUsersGroup,
  IconWallet,
  IconWheel,
  IconZoomQuestion,
} from "@tabler/icons-react";

import { NavMain } from "@/components/globals/admin/NavMain";
import { NavUser } from "@/components/globals/admin/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Admin",
    email: "m@example.com",
    avatar: "https://github.com/evilrabbit.png",
  },
  navMain: [
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
    {
      title: "Staff Management",
      url: "/admin/staff-management",
      icon: IconUserCog,
    },
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
  ],
};

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
                {/* <Image src="/logo.png" alt="Tire2Go" width={70} height={70} /> */}
                <IconCircleDotFilled className="!size-5" />
                <span className="text-base font-semibold">
                  Tire2Go Admin Panel
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
