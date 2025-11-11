"use client";

import React from "react";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Archive, Package, ArchiveRestore } from "lucide-react";
import { archiveOrdersManually } from "@/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OrdersTableProps {
  activeOrders: any[];
  archivedOrders: any[];
  archivedCount: number;
}

const OrdersTable = ({
  activeOrders,
  archivedOrders,
  archivedCount,
}: OrdersTableProps) => {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = React.useState(false);

  const handleManualArchive = async () => {
    if (
      !confirm(
        "Are you sure you want to manually archive orders older than 30 days? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsArchiving(true);
    try {
      const result = await archiveOrdersManually();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "Orders archived successfully");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to archive orders");
      console.error(error);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Tabs defaultValue="active" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Active Orders ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archived Orders ({archivedOrders.length})
          </TabsTrigger>
        </TabsList>
        <Button
          variant="outline"
          onClick={handleManualArchive}
          disabled={isArchiving}
          className="flex items-center gap-2"
        >
          <ArchiveRestore className="h-4 w-4" />
          {isArchiving ? "Archiving..." : "Archive Old Orders"}
        </Button>
      </div>

      <TabsContent value="active">
        <DataTable
          columns={columns}
          data={activeOrders}
          searchPlaceholder="Filter order ID or customer name..."
        />
      </TabsContent>

      <TabsContent value="archived">
        {archivedOrders.length > 0 ? (
          <>
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Archived orders are automatically created
                daily for orders older than 30 days. Archived order data is
                stored in JSON files in the database/archives folder and removed
                from the active database to save space.
              </p>
            </div>
            <DataTable
              columns={columns}
              data={archivedOrders}
              searchPlaceholder="Filter archived order ID or customer name..."
            />
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No archived orders yet.</p>
            <p className="text-sm mt-2">
              Orders older than 30 days are automatically archived daily.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default OrdersTable;


