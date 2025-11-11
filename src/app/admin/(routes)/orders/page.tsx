import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";
import OrdersTable from "./_components/orders-table";
import { getArchivedOrdersCount, getOrdersToArchiveSoon } from "@/actions";

const Page = async () => {
  // Get active (non-archived) orders
  const activeOrders = await db.order.findMany({
    where: {
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      orderItem: true,
    },
  });

  // Get archived orders
  const archivedOrders = await db.order.findMany({
    where: {
      isArchived: true,
    },
    orderBy: {
      archivedAt: "desc",
    },
    include: {
      orderItem: true,
    },
  });

  // Get archive statistics
  const [archivedCountResult, soonToArchiveResult] = await Promise.all([
    getArchivedOrdersCount(),
    getOrdersToArchiveSoon(),
  ]);

  const archivedCount = archivedCountResult.success ? archivedCountResult.count : 0;
  const soonToArchiveCount = soonToArchiveResult.success ? soonToArchiveResult.count : 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Manage Orders"
          description="Browse and manage all orders in your store."
        />
      </div>

      {/* Archive Statistics */}
      {(archivedCount > 0 || soonToArchiveCount > 0) && (
        <div className="mt-5 grid grid-cols-2 gap-4">
          {archivedCount > 0 && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">Archived Orders</p>
              <p className="text-2xl font-bold">{archivedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Orders archived after 30 days
              </p>
            </div>
          )}
          {soonToArchiveCount > 0 && (
            <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/20">
              <p className="text-sm text-muted-foreground">Orders to Archive Soon</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                {soonToArchiveCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Will be archived within 7 days
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-5">
        <OrdersTable
          activeOrders={activeOrders}
          archivedOrders={archivedOrders}
          archivedCount={archivedCount}
        />
      </div>
    </div>
  );
};

export default Page;
