import React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/globals/admin/AppSidebar";
import { SiteHeader } from "@/components/globals/admin/SiteHeader";
import AdminChatApp from '@/components/globals/admin/AdminChatApp';
import { PageLoadingOverlay } from "@/components/globals/admin/PageLoadingOverlay";

type Props = {
  children: React.ReactNode;
};

const AdminLayout = ({ children }: Props) => {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <PageLoadingOverlay />
        <main className='px-3 sm:px-4 md:px-6 py-4 sm:py-5'>{children}</main>
        <AdminChatApp />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
