"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPanelUserType, canAccessAdminPath } from "@/lib/admin-access";

const AdminRouteGuard = ({ userType }: { userType: AdminPanelUserType }) => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname?.startsWith("/admin")) {
      return;
    }

    if (!canAccessAdminPath(userType, pathname)) {
      toast.error("Access denied. You don't have permission to access this page.");
      router.replace("/admin/dashboard");
    }
  }, [pathname, router, userType]);

  return null;
};

export default AdminRouteGuard;

