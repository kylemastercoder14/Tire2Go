/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconX } from "@tabler/icons-react";

interface InventoryAlertBannerProps {
  inventory: any[];
  userRole?: "admin" | "owner";
}

export function InventoryAlertBanner({ inventory, userRole = "admin" }: InventoryAlertBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const criticalItems = inventory.filter((item) => item.quantity <= 0 || item.status === "OUT_OF_STOCK");

  // Don't show if dismissed or no critical items
  if (isDismissed || criticalItems.length === 0) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    // No localStorage - banner will reappear on page refresh if critical items still exist
  };

  const inventoryUrl = userRole === "admin"
    ? "/admin/inventory-management"
    : "/owner/inventory-management";

  const itemText = criticalItems.length === 1 ? "item" : "items";
  const message = criticalItems.length > 0
    ? `Alert: ${criticalItems.length} product ${itemText} ${criticalItems.length === 1 ? "has" : "have"} critical stock levels or ${criticalItems.length === 1 ? "is" : "are"} out of stock.`
    : "";

  return (
    <div className="w-full bg-red-600 text-white py-3 px-4 mb-5 rounded-xl flex items-center justify-between relative z-50">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <IconAlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm sm:text-base flex-1">
          {message}
          <Link
            href={inventoryUrl}
            className="underline font-semibold hover:opacity-80 ml-1"
          >
            View inventory alerts
          </Link>
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDismiss}
        className="h-8 w-8 text-white hover:bg-red-700 hover:text-white flex-shrink-0 ml-2"
      >
        <IconX className="h-4 w-4" />
      </Button>
    </div>
  );
}
