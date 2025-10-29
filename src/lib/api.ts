import db from "@/lib/db";

export type Period =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semiAnnual"
  | "annual";

const getPeriodDates = (period: Period) => {
  const now = new Date();
  let currentStart: Date, currentEnd: Date, lastStart: Date, lastEnd: Date;

  switch (period) {
    case "weekly": {
      const dayOfWeek = now.getDay();
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - dayOfWeek);
      currentStart.setHours(0, 0, 0, 0);
      currentEnd = new Date(currentStart);
      currentEnd.setDate(currentStart.getDate() + 6);
      currentEnd.setHours(23, 59, 59, 999);
      lastStart = new Date(currentStart);
      lastStart.setDate(currentStart.getDate() - 7);
      lastEnd = new Date(currentEnd);
      lastEnd.setDate(currentEnd.getDate() - 7);
      break;
    }
    case "monthly": {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currentEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      lastEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    }
    case "quarterly": {
      const quarter = Math.floor(now.getMonth() / 3);
      currentStart = new Date(now.getFullYear(), quarter * 3, 1);
      currentEnd = new Date(
        now.getFullYear(),
        quarter * 3 + 3,
        0,
        23,
        59,
        59,
        999
      );
      lastStart = new Date(now.getFullYear(), quarter * 3 - 3, 1);
      lastEnd = new Date(now.getFullYear(), quarter * 3, 0, 23, 59, 59, 999);
      break;
    }
    case "semiAnnual": {
      const half = now.getMonth() < 6 ? 0 : 6;
      currentStart = new Date(now.getFullYear(), half, 1);
      currentEnd = new Date(now.getFullYear(), half + 6, 0, 23, 59, 59, 999);
      lastStart = new Date(now.getFullYear(), half - 6, 1);
      lastEnd = new Date(now.getFullYear(), half, 0, 23, 59, 59, 999);
      break;
    }
    case "annual": {
      currentStart = new Date(now.getFullYear(), 0, 1);
      currentEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      lastStart = new Date(now.getFullYear() - 1, 0, 1);
      lastEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      break;
    }
  }

  return { currentStart, currentEnd, lastStart, lastEnd };
};

const calculateMetric = (currentValue: number, lastValue: number) => {
  const diff = currentValue - lastValue;
  const percentage = lastValue
    ? ((diff / lastValue) * 100).toFixed(1) + "%"
    : "100%";
  const trend: "up" | "down" = diff >= 0 ? "up" : "down";
  return { percentage, trend };
};

export const getStatsByPeriod = async (period: Period) => {
  const { currentStart, currentEnd, lastStart, lastEnd } =
    getPeriodDates(period);

  const orders = await db.order.findMany({ include: { orderItem: true } });
  const users = await db.users.findMany();
  const inventories = await db.inventory.findMany({
    include: { product: true },
  });

  // Total Revenue
  const revenueThis = orders
    .filter((o) => o.createdAt >= currentStart && o.createdAt <= currentEnd)
    .reduce((acc, o) => acc + (o.discountedAmount ?? o.totalAmount), 0);
  const revenueLast = orders
    .filter((o) => o.createdAt >= lastStart && o.createdAt <= lastEnd)
    .reduce((acc, o) => acc + (o.discountedAmount ?? o.totalAmount), 0);
  const revenueStats = calculateMetric(revenueThis, revenueLast);

  // New Customers
  const customersThis = users.filter(
    (u) => u.createdAt >= currentStart && u.createdAt <= currentEnd
  ).length;
  const customersLast = users.filter(
    (u) => u.createdAt >= lastStart && u.createdAt <= lastEnd
  ).length;
  const customerStats = calculateMetric(customersThis, customersLast);

  // Tires Sold
  const tiresThis = orders
    .filter((o) => o.createdAt >= currentStart && o.createdAt <= currentEnd)
    .reduce(
      (acc, o) => acc + o.orderItem.reduce((sum, i) => sum + i.quantity, 0),
      0
    );
  const tiresLast = orders
    .filter((o) => o.createdAt >= lastStart && o.createdAt <= lastEnd)
    .reduce(
      (acc, o) => acc + o.orderItem.reduce((sum, i) => sum + i.quantity, 0),
      0
    );
  const tiresStats = calculateMetric(tiresThis, tiresLast);

  // Inventory Turnover
  const totalInventory = inventories.reduce(
    (acc, inv) => acc + inv.quantity,
    0
  );
  const inventoryThis = totalInventory ? (tiresThis / totalInventory) * 100 : 0;
  const inventoryLast = totalInventory ? (tiresLast / totalInventory) * 100 : 0;
  const inventoryStats = calculateMetric(inventoryThis, inventoryLast);

  const stats = [
    {
      title: "Total Revenue",
      data: `₱${revenueThis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      percentage: revenueStats.percentage,
      trend: revenueStats.trend,
      description: `Compared to last ${period}`,
      recommendation:
        revenueStats.trend === "up"
          ? "Revenue is growing! Keep it up."
          : "Consider promotions to boost revenue.",
    },
    {
      title: "New Customers",
      data: `${customersThis}`,
      percentage: customerStats.percentage,
      trend: customerStats.trend,
      description: `Compared to last ${period}`,
      recommendation:
        customerStats.trend === "up"
          ? "New customers are coming in! Good job."
          : "Focus on customer retention strategies.",
    },
    {
      title: "Tires Sold",
      data: `${tiresThis}`,
      percentage: tiresStats.percentage,
      trend: tiresStats.trend,
      description: `Compared to last ${period}`,
      recommendation:
        tiresStats.trend === "up"
          ? "Sales are improving! Consider upselling."
          : "Consider promotions to increase sales.",
    },
    {
      title: "Inventory Turnover",
      data: `${inventoryThis.toFixed(1)}%`,
      percentage: inventoryStats.percentage,
      trend: inventoryStats.trend,
      description: `Compared to last ${period}`,
      recommendation:
        inventoryStats.trend === "up"
          ? "Inventory is moving well."
          : "Review stock levels to avoid overstock.",
    },
  ];

  return stats;
};
