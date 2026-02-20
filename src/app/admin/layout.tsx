import React from "react";
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/globals/admin/AppSidebar";
import { SiteHeader } from "@/components/globals/admin/SiteHeader";
import AdminChatApp from '@/components/globals/admin/AdminChatApp';
import { PageLoadingOverlay } from "@/components/globals/admin/PageLoadingOverlay";
import AdminRouteGuard from "@/components/globals/admin/AdminRouteGuard";
import { AdminUserTypeProvider } from "@/components/globals/admin/AdminUserTypeProvider";
import { getCurrentAdminUserType } from "@/lib/admin-auth";

type Props = {
  children: React.ReactNode;
};

const AdminLayout = async ({ children }: Props) => {
  const userType = await getCurrentAdminUserType();

  if (!userType) {
    redirect("/?error=access_denied");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AdminUserTypeProvider userType={userType}>
        <AppSidebar variant="inset" userType={userType} />
        <SidebarInset>
          <AdminRouteGuard userType={userType} />
          <SiteHeader />
          <PageLoadingOverlay />
          <main className='px-3 sm:px-4 md:px-6 py-4 sm:py-5'>{children}</main>
          <AdminChatApp />
        </SidebarInset>
      </AdminUserTypeProvider>
    </SidebarProvider>
  );
};

export default AdminLayout;
