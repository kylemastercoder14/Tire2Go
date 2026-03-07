"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPanelUserType, canAccessAdminPath } from "@/lib/admin-access";

const OwnerRouteGuard = ({ userType }: { userType: AdminPanelUserType }) => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname?.startsWith("/owner")) {
      return;
    }

    const mappedAdminPath = pathname.replace("/owner", "/admin");

    if (!canAccessAdminPath(userType, mappedAdminPath)) {
      toast.error("Access denied. You don't have permission to access this page.");
      router.replace("/owner/dashboard");
    }
  }, [pathname, router, userType]);

  return null;
};

export default OwnerRouteGuard;

