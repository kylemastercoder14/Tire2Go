"use client";

import * as React from "react";
import {
  IconCircleDotFilled,
  IconDashboard,
  IconFileText,
  IconMessageCircle,
  IconUsersGroup,
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
    url: "/owner/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Customers",
    url: "/owner/customers",
    icon: IconUsersGroup,
  },
  {
    title: "Feedback",
    url: "/owner/feedback",
    icon: IconFileText,
  },
  {
    title: "Product Reviews",
    url: "/owner/product-reviews",
    icon: IconMessageCircle,
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
              <a href="/owner/dashboard" className="flex items-center gap-2">
                {/* <Image src="/logo.png" alt="Tyre2Go" width={70} height={70} /> */}
                <IconCircleDotFilled className="!size-5" />
                <span className="text-base font-semibold">
                  Tyre2Go Owner Panel
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
