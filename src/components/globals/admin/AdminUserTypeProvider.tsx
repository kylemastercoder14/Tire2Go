"use client";

import { createContext, useContext, type ReactNode } from "react";

import { AdminPanelUserType } from "@/lib/admin-access";

const AdminUserTypeContext = createContext<AdminPanelUserType | null | undefined>(
  undefined
);

export const AdminUserTypeProvider = ({
  children,
  userType,
}: {
  children: ReactNode;
  userType: AdminPanelUserType | null;
}) => {
  return (
    <AdminUserTypeContext.Provider value={userType}>
      {children}
    </AdminUserTypeContext.Provider>
  );
};

export const useAdminUserType = () => useContext(AdminUserTypeContext);
