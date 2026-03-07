export type AdminPanelUserType = "ADMIN" | "OWNER";

export type AdminPermissionModule =
  | "dashboard"
  | "brands"
  | "products"
  | "carManagement"
  | "tireSizes"
  | "inventoryManagement"
  | "customers"
  | "orders"
  | "tipsGuides"
  | "faqs"
  | "promotions"
  | "feedback"
  | "policies"
  | "backupRecovery"
  | "userManagement"
  | "systemSettings"
  | "productReviews"
  | "inquiries";

export type AdminPermissionAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "process";

type PermissionMatrix = Record<
  AdminPanelUserType,
  Record<AdminPermissionModule, AdminPermissionAction[]>
>;

const CRUD_ACTIONS: AdminPermissionAction[] = [
  "view",
  "create",
  "update",
  "delete",
];

const OWNER_FULL_ACTIONS: AdminPermissionAction[] = [
  "view",
  "create",
  "update",
  "delete",
  "process",
];

const ADMIN_PERMISSION_MATRIX: PermissionMatrix = {
  ADMIN: {
    dashboard: ["view"],
    brands: ["view", "create", "update"],
    products: CRUD_ACTIONS,
    carManagement: CRUD_ACTIONS,
    tireSizes: CRUD_ACTIONS,
    inventoryManagement: ["view", "update"],
    customers: ["view", "update"],
    orders: ["view", "update", "process"],
    tipsGuides: ["view", "create", "update"],
    faqs: ["view", "create", "update"],
    promotions: [],
    feedback: [],
    policies: [],
    backupRecovery: [],
    userManagement: [],
    systemSettings: [],
    productReviews: [],
    inquiries: [],
  },
  OWNER: {
    dashboard: ["view"],
    brands: CRUD_ACTIONS,
    products: CRUD_ACTIONS,
    carManagement: CRUD_ACTIONS,
    tireSizes: CRUD_ACTIONS,
    inventoryManagement: CRUD_ACTIONS,
    customers: CRUD_ACTIONS,
    orders: OWNER_FULL_ACTIONS,
    tipsGuides: CRUD_ACTIONS,
    faqs: CRUD_ACTIONS,
    promotions: CRUD_ACTIONS,
    feedback: ["view", "delete"],
    policies: CRUD_ACTIONS,
    backupRecovery: CRUD_ACTIONS,
    userManagement: CRUD_ACTIONS,
    systemSettings: CRUD_ACTIONS,
    productReviews: [],
    inquiries: [],
  },
};

const ADMIN_ROUTE_MODULES: Array<{ prefix: string; module: AdminPermissionModule }> = [
  { prefix: "/admin/promotions-and-discounts", module: "promotions" },
  { prefix: "/admin/inventory-management", module: "inventoryManagement" },
  { prefix: "/admin/staff-management", module: "userManagement" },
  { prefix: "/admin/product-reviews", module: "productReviews" },
  { prefix: "/admin/backup-recovery", module: "backupRecovery" },
  { prefix: "/admin/tips-and-guides", module: "tipsGuides" },
  { prefix: "/admin/car-management", module: "carManagement" },
  { prefix: "/admin/car-models", module: "carManagement" },
  { prefix: "/admin/car-makes", module: "carManagement" },
  { prefix: "/admin/tire-sizes", module: "tireSizes" },
  { prefix: "/admin/dashboard", module: "dashboard" },
  { prefix: "/admin/customers", module: "customers" },
  { prefix: "/admin/settings", module: "systemSettings" },
  { prefix: "/admin/inquiries", module: "inquiries" },
  { prefix: "/admin/feedback", module: "feedback" },
  { prefix: "/admin/policies", module: "policies" },
  { prefix: "/admin/products", module: "products" },
  { prefix: "/admin/brands", module: "brands" },
  { prefix: "/admin/orders", module: "orders" },
  { prefix: "/admin/faqs", module: "faqs" },
  { prefix: "/admin", module: "dashboard" },
];

const normalizePathname = (pathname: string) => {
  const basePath = pathname.split("?")[0].split("#")[0];
  if (basePath.length > 1 && basePath.endsWith("/")) {
    return basePath.slice(0, -1);
  }
  return basePath;
};

export const isAdminPanelUserType = (
  userType: string | null | undefined
): userType is AdminPanelUserType => {
  return userType === "ADMIN" || userType === "OWNER";
};

export const canPerformAdminAction = (
  userType: AdminPanelUserType,
  permissionModule: AdminPermissionModule,
  action: AdminPermissionAction
) => {
  return ADMIN_PERMISSION_MATRIX[userType][permissionModule].includes(action);
};

export const getAdminModuleFromPath = (
  pathname: string
): AdminPermissionModule | null => {
  const normalizedPath = normalizePathname(pathname);

  for (const routeModule of ADMIN_ROUTE_MODULES) {
    if (routeModule.prefix === "/admin") {
      if (normalizedPath === "/admin") {
        return routeModule.module;
      }
      continue;
    }

    if (
      normalizedPath === routeModule.prefix ||
      normalizedPath.startsWith(`${routeModule.prefix}/`)
    ) {
      return routeModule.module;
    }
  }

  return null;
};

export const getRequiredActionFromPath = (
  pathname: string
): AdminPermissionAction => {
  const normalizedPath = normalizePathname(pathname);
  if (normalizedPath.endsWith("/create")) {
    return "create";
  }
  return "view";
};

export const canAccessAdminPath = (
  userType: AdminPanelUserType,
  pathname: string
) => {
  const targetModule = getAdminModuleFromPath(pathname);
  if (!targetModule) {
    return false;
  }

  const requiredAction = getRequiredActionFromPath(pathname);
  return canPerformAdminAction(userType, targetModule, requiredAction);
};
