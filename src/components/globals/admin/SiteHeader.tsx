"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPageTitle } from "@/lib/utils";
import { getLowStockInventory } from "@/actions";
import { UserButton } from "@clerk/nextjs";
import { AlertTriangle, Bell, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// Your navMain config
const navMain = [
  { title: "Dashboard", url: "/admin/dashboard" },
  { title: "Brands", url: "/admin/brands" },
  { title: "Product Catalog", url: "/admin/products" },
  { title: "Inventory Management", url: "/admin/inventory-management" },
  { title: "Customers", url: "/admin/customers" },
  { title: "Orders", url: "/admin/orders" },
  { title: "Promotion & Discounts", url: "/admin/promotions-and-discounts" },
  { title: "Feedback", url: "/admin/feedback" },
  { title: "Inquiries", url: "/admin/inquiries" },
  { title: "Settings", url: "/admin/settings" },
  { title: "Tips & Guides", url: "/admin/tips-and-guides" },
  { title: "FAQs", url: "/admin/faqs" },
  { title: "Policies", url: "/admin/policies" },
  { title: "Staff Management", url: "/admin/staff-management" },
  { title: "Backup & Restore", url: "/admin/backup-recovery" },
  { title: "Car Management", url: "/admin/car-management" },
];

type LowStockItem = {
  id: string;
  quantity: number;
  minStock: number;
  status: string;
  product: {
    id: string;
    name: string;
    brand: {
      name: string;
    };
  };
};

export function SiteHeader() {
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const currentPage = getPageTitle(pathname, navMain);

  // Fetch low stock items
  useEffect(() => {
    const fetchLowStock = async () => {
      setIsLoadingNotifications(true);
      try {
        const result = await getLowStockInventory();
        if (result.data) {
          setLowStockItems(result.data as LowStockItem[]);
        }
      } catch (error) {
        console.error("Error fetching low stock items:", error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchLowStock();
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchLowStock, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (inventoryId: string) => {
    router.push(`/admin/inventory-management/${inventoryId}`);
    setIsNotificationOpen(false);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const formattedDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Manila",
      });
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Manila",
      });

      const gmtOffset = "GMT+8 PH Time";
      setCurrentDateTime(`${formattedDate} - ${formattedTime} (${gmtOffset})`);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-sm sm:text-base font-medium truncate max-w-[200px] sm:max-w-none">
          {currentPage}
        </h1>
        <div className="ml-auto flex items-center gap-2 lg:gap-3">
          <h1 className="text-sm sm:text-base hidden sm:block">
            {currentDateTime}
          </h1>

          {/* Notification Modal */}
          <Dialog
            open={isNotificationOpen}
            onOpenChange={setIsNotificationOpen}
          >
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Inventory Notifications
                </DialogTitle>
                <DialogDescription>
                  {lowStockItems.length > 0
                    ? `${lowStockItems.length} product${lowStockItems.length > 1 ? "s" : ""} ${lowStockItems.length > 1 ? "are" : "is"} running low on stock`
                    : "All products are in stock"}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto mt-4">
                {isLoadingNotifications ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : lowStockItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium text-muted-foreground">
                      No inventory alerts
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All products are currently in stock
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lowStockItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNotificationClick(item.id)}
                        className="w-full p-4 text-left border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle
                                className={`h-4 w-4 flex-shrink-0 ${
                                  item.status === "OUT_OF_STOCK"
                                    ? "text-red-500"
                                    : "text-orange-500"
                                }`}
                              />
                              <p className="font-medium text-sm truncate">
                                {item.product.name}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mb-2">
                              {item.product.brand.name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>
                                Stock:{" "}
                                <strong className="text-foreground">
                                  {item.quantity}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Min:{" "}
                                <strong className="text-foreground">
                                  {item.minStock}
                                </strong>
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              item.status === "OUT_OF_STOCK"
                                ? "destructive"
                                : "secondary"
                            }
                            className="ml-2 flex-shrink-0"
                          >
                            {item.status === "OUT_OF_STOCK"
                              ? "Out of Stock"
                              : "Low Stock"}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {lowStockItems.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      router.push("/admin/inventory-management");
                      setIsNotificationOpen(false);
                    }}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    View All Inventory
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <div className="relative">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 sm:h-9 sm:w-9",
                  userButtonPopoverCard: "shadow-lg",
                  userButtonPopoverActions: "p-2",
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Action
                  onClick={() => setIsNotificationOpen(true)}
                  label="Notification"
                  labelIcon={<Bell className="size-4" />}
                />
              </UserButton.MenuItems>
            </UserButton>
            <div className="absolute size-2 bg-destructive rounded-full top-0 right-0"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
