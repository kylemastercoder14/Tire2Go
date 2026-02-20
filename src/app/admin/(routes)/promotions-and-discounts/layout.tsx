import React from "react";
import { redirect } from "next/navigation";

import { checkAdminPermission } from "@/lib/admin-auth";

const PromotionsLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const permission = await checkAdminPermission("promotions", "view");

  if (!permission.allowed) {
    redirect("/admin/dashboard?error=access_denied");
  }

  return <>{children}</>;
};

export default PromotionsLayout;

