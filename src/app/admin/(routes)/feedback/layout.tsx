import React from "react";
import { redirect } from "next/navigation";

import { checkAdminPermission } from "@/lib/admin-auth";

const FeedbackLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const permission = await checkAdminPermission("feedback", "view");

  if (!permission.allowed) {
    redirect("/admin/dashboard?error=access_denied");
  }

  return <>{children}</>;
};

export default FeedbackLayout;

