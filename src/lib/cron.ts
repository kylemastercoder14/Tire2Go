import cron from "node-cron";
import db from "./db";

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

// 👉 Run once immediately on startup
updateInventoryStatuses().catch((err) =>
  console.error("Error running inventory update on startup:", err)
);

// 👉 Schedule to run every 5 minute
cron.schedule("*/5 * * * *", async () => {
  await updateInventoryStatuses();
});
