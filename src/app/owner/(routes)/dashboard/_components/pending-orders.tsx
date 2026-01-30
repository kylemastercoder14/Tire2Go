"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { IconArrowRight, IconClock } from "@tabler/icons-react";

interface PendingOrdersSectionProps {
  orders: any[];
}

export function PendingOrdersSection({ orders }: PendingOrdersSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconClock className="h-5 w-5 text-orange-500" />
            <CardTitle>Pending Orders</CardTitle>
          </div>
          <Badge variant="secondary">{orders.length}</Badge>
        </div>
        <CardDescription>
          Orders awaiting processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <IconClock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No pending orders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">
                      {order.name}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {order.orderItem.length} {order.orderItem.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      ₱ {formatCurrency(order.discountedAmount || order.totalAmount)}
                    </p>
                  </div>
                  <Link href="/owner/orders">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <IconArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {orders.length > 5 && (
              <Link href="/owner/orders">
                <Button variant="outline" className="w-full mt-2">
                  View All Pending Orders ({orders.length})
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
