import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { checkAdminPermission } from "@/lib/admin-auth";

const SettingsLayout = async ({ children }: { children: ReactNode }) => {
  const permission = await checkAdminPermission("systemSettings", "view");

  if (!permission.allowed) {
    redirect("/admin/dashboard?error=access_denied");
  }

  return <>{children}</>;
};

export default SettingsLayout;

