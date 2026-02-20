"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AdminPanelUserType,
  AdminPermissionAction,
  AdminPermissionModule,
  canPerformAdminAction,
  isAdminPanelUserType,
} from "@/lib/admin-access";
import { useAdminUserType } from "@/components/globals/admin/AdminUserTypeProvider";

type UseAdminPermissionsResult = {
  can: (module: AdminPermissionModule, action: AdminPermissionAction) => boolean;
  isLoading: boolean;
  userType: AdminPanelUserType | null;
};

let userTypeRequest: Promise<AdminPanelUserType | null> | null = null;

const fetchAdminUserType = async (): Promise<AdminPanelUserType | null> => {
  if (!userTypeRequest) {
    userTypeRequest = (async () => {
      try {
        const response = await fetch("/api/user/check-type");
        const data = await response.json();

        if (response.ok && data.success && isAdminPanelUserType(data.userType)) {
          return data.userType;
        }

        return null;
      } catch (error) {
        console.error("Error fetching admin permissions:", error);
        return null;
      } finally {
        userTypeRequest = null;
      }
    })();
  }

  return userTypeRequest;
};

export const useAdminPermissions = (): UseAdminPermissionsResult => {
  const contextUserType = useAdminUserType();
  const hasContextUserType = contextUserType !== undefined;

  const [isLoading, setIsLoading] = useState(!hasContextUserType);
  const [userType, setUserType] = useState<AdminPanelUserType | null>(
    hasContextUserType ? contextUserType ?? null : null
  );

  useEffect(() => {
    let isMounted = true;

    if (hasContextUserType) {
      setUserType(contextUserType ?? null);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const loadUserType = async () => {
      const resolvedUserType = await fetchAdminUserType();

      if (isMounted) {
        setUserType(resolvedUserType);
        setIsLoading(false);
      }
    };

    loadUserType();

    return () => {
      isMounted = false;
    };
  }, [contextUserType, hasContextUserType]);

  const effectiveUserType = hasContextUserType ? contextUserType ?? null : userType;

  const can = useMemo(
    () =>
      (module: AdminPermissionModule, action: AdminPermissionAction) => {
        if (!effectiveUserType) {
          return false;
        }
        return canPerformAdminAction(effectiveUserType, module, action);
      },
    [effectiveUserType]
  );

  return {
    can,
    isLoading: hasContextUserType ? false : isLoading,
    userType: effectiveUserType,
  };
};
