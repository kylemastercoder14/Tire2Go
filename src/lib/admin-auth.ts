import "server-only";

import { auth } from "@clerk/nextjs/server";

import db from "@/lib/db";
import {
  AdminPermissionAction,
  AdminPermissionModule,
  AdminPanelUserType,
  canAccessAdminPath,
  canPerformAdminAction,
  isAdminPanelUserType,
} from "@/lib/admin-access";

type PermissionAllowed = {
  allowed: true;
  userType: AdminPanelUserType;
};

type PermissionDenied = {
  allowed: false;
  status: 401 | 403;
  error: string;
};

export type AdminPermissionCheckResult = PermissionAllowed | PermissionDenied;

const getDeniedResponse = (
  status: 401 | 403,
  error: string
): PermissionDenied => ({
  allowed: false,
  status,
  error,
});

export const getCurrentAdminUserType = async (): Promise<AdminPanelUserType | null> => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await db.users.findUnique({
    where: { authId: userId },
    select: { userType: true },
  });

  if (!user || !isAdminPanelUserType(user.userType)) {
    return null;
  }

  return user.userType;
};

export const checkAdminPermission = async (
  permissionModule: AdminPermissionModule,
  action: AdminPermissionAction
): Promise<AdminPermissionCheckResult> => {
  const { userId } = await auth();

  if (!userId) {
    return getDeniedResponse(401, "Unauthorized");
  }

  const user = await db.users.findUnique({
    where: { authId: userId },
    select: { userType: true },
  });

  if (!user || !isAdminPanelUserType(user.userType)) {
    return getDeniedResponse(403, "Access denied");
  }

  if (!canPerformAdminAction(user.userType, permissionModule, action)) {
    return getDeniedResponse(
      403,
      "Access denied. You don't have permission for this action."
    );
  }

  return {
    allowed: true,
    userType: user.userType,
  };
};

export const checkAdminRouteAccess = async (
  pathname: string
): Promise<AdminPermissionCheckResult> => {
  const { userId } = await auth();

  if (!userId) {
    return getDeniedResponse(401, "Unauthorized");
  }

  const user = await db.users.findUnique({
    where: { authId: userId },
    select: { userType: true },
  });

  if (!user || !isAdminPanelUserType(user.userType)) {
    return getDeniedResponse(403, "Access denied");
  }

  if (!canAccessAdminPath(user.userType, pathname)) {
    return getDeniedResponse(403, "Access denied");
  }

  return {
    allowed: true,
    userType: user.userType,
  };
};
