"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconBadgeTm,
  IconBox,
  IconCar,
  IconCircleDotFilled,
  IconDatabase,
  IconDashboard,
  IconFileText,
  IconHelpCircle,
  IconScale,
  IconSettings,
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
  AdminPanelUserType,
  canAccessAdminPath,
} from "@/lib/admin-access";
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
    title: "Brands",
    url: "/owner/brands",
    icon: IconBadgeTm,
  },
  {
    title: "Product Catalog",
    url: "/owner/products",
    icon: IconSitemap,
  },
  {
    title: "Car Management",
    url: "/owner/car-management",
    icon: IconCar,
  },
  {
    title: "Tire Sizes",
    url: "/owner/tire-sizes",
    icon: IconWheel,
  },
  {
    title: "Inventory Management",
    url: "/owner/inventory-management",
    icon: IconBox,
  },
  {
    title: "Customers",
    url: "/owner/customers",
    icon: IconUsersGroup,
  },
  {
    title: "Orders",
    url: "/owner/orders",
    icon: IconWallet,
  },
  {
    title: "Promotions & Discounts",
    url: "/owner/promotions-and-discounts",
    icon: IconTag,
  },
  {
    title: "Tips & Guides",
    url: "/owner/tips-and-guides",
    icon: IconHelpCircle,
  },
  {
    title: "Feedback",
    url: "/owner/feedback",
    icon: IconFileText,
  },
  {
    title: "FAQs",
    url: "/owner/faqs",
    icon: IconZoomQuestion,
  },
  {
    title: "Policies",
    url: "/owner/policies",
    icon: IconScale,
  },
  {
    title: "Backup & Recovery",
    url: "/owner/backup-recovery",
    icon: IconDatabase,
  },
  {
    title: "User Management",
    url: "/owner/staff-management",
    icon: IconUserCog,
  },
  {
    title: "System Settings",
    url: "/owner/settings",
    icon: IconSettings,
  },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  userType: AdminPanelUserType;
};

export function AppSidebar({ userType, ...props }: AppSidebarProps) {
  const filteredNavItems = navMainData.filter((item) =>
    canAccessAdminPath(userType, item.url.replace("/owner", "/admin"))
  );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/owner/dashboard" className="flex items-center gap-2">
                {/* <Image src="/logo.png" alt="Tyre2Go" width={70} height={70} /> */}
                <IconCircleDotFilled className="!size-5" />
                <span className="text-base font-semibold">
                  Tyre2Go Owner Panel
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavItems} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
