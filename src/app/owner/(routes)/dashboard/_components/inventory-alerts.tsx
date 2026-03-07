"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconPackage } from "@tabler/icons-react";

interface InventoryAlertsSectionProps {
  inventory: any[];
}

export function InventoryAlertsSection({ inventory }: InventoryAlertsSectionProps) {
  const criticalItems = inventory.filter((item) => item.quantity <= 0 || item.status === "OUT_OF_STOCK");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconAlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle>Inventory Alerts</CardTitle>
          </div>
          <Badge variant="destructive">{criticalItems.length}</Badge>
        </div>
        <CardDescription>
          Products with critical stock levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        {criticalItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <IconPackage className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>All products in stock</p>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50/50 hover:bg-red-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">
                      {item.product.name}
                    </p>
                    <Badge variant="destructive" className="text-xs">
                      {item.status === "OUT_OF_STOCK" ? "Out of Stock" : "Critical"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.product.brand.name}
                  </p>
                  {item.sku && (
                    <p className="text-xs text-muted-foreground">
                      SKU: {item.sku}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <p className={`font-bold text-sm ${item.quantity <= 0 ? "text-red-600" : "text-orange-600"}`}>
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <Link href="/admin/inventory-management">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <IconPackage className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {criticalItems.length > 5 && (
              <Link href="/admin/inventory-management">
                <Button variant="outline" className="w-full mt-2">
                  View All Alerts ({criticalItems.length})
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
