import React from "react";
import { redirect } from "next/navigation";

import { checkAdminPermission } from "@/lib/admin-auth";

const InquiriesLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const permission = await checkAdminPermission("inquiries", "view");

  if (!permission.allowed) {
    redirect("/admin/dashboard?error=access_denied");
  }

  return <>{children}</>;
};

export default InquiriesLayout;
