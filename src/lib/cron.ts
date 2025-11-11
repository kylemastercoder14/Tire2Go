import cron from "node-cron";
import db from "./db";
import fs from "fs/promises";
import path from "path";

async function updateInventoryStatuses() {
  console.log("Running inventory cron job...");
  const inventories = await db.inventory.findMany();

  for (const item of inventories) {
    let status = "IN_STOCK";

    if (item.quantity <= 0) status = "OUT_OF_STOCK";
    else if (item.quantity <= item.minStock) status = "LOW_STOCK";

    if (status !== item.status) {
      await db.inventory.update({
        where: { id: item.id },
        data: { status },
      });
    }
  }

  console.log("Inventory statuses updated.");
}

export async function archiveOldOrders() {
  console.log("Running order archive cron job...");

  try {
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find orders older than 30 days that are not already archived
    const ordersToArchive = await db.order.findMany({
      where: {
        isArchived: false,
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
      include: {
        orderItem: {
          include: {
            product: {
              include: {
                brand: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (ordersToArchive.length === 0) {
      console.log("No orders to archive.");
      return;
    }

    // Create archive directory if it doesn't exist
    const archiveDir = path.join(
      process.cwd(),
      "public",
      "database",
      "archives"
    );
    await fs.mkdir(archiveDir, { recursive: true });

    // Archive orders in batches
    const archiveDate = new Date().toISOString().replace(/[:.]/g, "-");
    const archiveFileName = `orders_archive_${archiveDate}.json`;
    const archivePath = path.join(archiveDir, archiveFileName);

    // Prepare archive data
    const archiveData = {
      archivedAt: new Date().toISOString(),
      count: ordersToArchive.length,
      orders: ordersToArchive.map((order) => ({
        id: order.id,
        userId: order.userId,
        totalAmount: order.totalAmount,
        discountedAmount: order.discountedAmount,
        name: order.name,
        email: order.email,
        phoneNumber: order.phoneNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        orderOption: order.orderOption,
        preferredDate: order.preferredDate.toISOString(),
        remarks: order.remarks,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        processingAt: order.processingAt?.toISOString(),
        shippedAt: order.shippedAt?.toISOString(),
        completedAt: order.completedAt?.toISOString(),
        reasonCancelled: order.reasonCancelled,
        cancelledAt: order.cancelledAt?.toISOString(),
        orderItem: order.orderItem.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.product.id,
            name: item.product.name,
            brand: {
              id: item.product.brand.id,
              name: item.product.brand.name,
            },
          },
        })),
        user: order.user,
      })),
    };

    // Save to archive file
    await fs.writeFile(
      archivePath,
      JSON.stringify(archiveData, null, 2),
      "utf-8"
    );

    // Mark orders as archived
    const orderIds = ordersToArchive.map((order) => order.id);
    await db.order.updateMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    // Delete order items (cascade delete through Prisma)
    await db.orderItem.deleteMany({
      where: {
        orderId: {
          in: orderIds,
        },
      },
    });

    console.log(
      `Archived ${ordersToArchive.length} orders to ${archiveFileName}`
    );
  } catch (error) {
    console.error("Error archiving orders:", error);
  }
}

// 👉 Run once immediately on startup
updateInventoryStatuses().catch((err) =>
  console.error("Error running inventory update on startup:", err)
);

// 👉 Schedule to run every 5 minute
cron.schedule("*/5 * * * *", async () => {
  await updateInventoryStatuses();
});

// 👉 Schedule order archiving to run daily at 2 AM
cron.schedule("0 2 * * *", async () => {
  await archiveOldOrders();
});

// 👉 Run archiving once on startup (optional - for testing)
// archiveOldOrders().catch((err) =>
//   console.error("Error running order archive on startup:", err)
// );
