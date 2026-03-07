import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { UserType } from "@prisma/client";
import DashboardContent from "./client";

const Page = async () => {
  // Server-side admin check
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    const user = await db.users.findUnique({
      where: { authId: userId },
      select: { userType: true },
    });

    if (
      !user ||
      (user.userType !== UserType.ADMIN && user.userType !== UserType.OWNER)
    ) {
      redirect("/?error=access_denied");
    }
  } catch (error) {
    console.error("Error checking admin access:", error);
    redirect("/sign-in");
  }

  const orders = await db.order.findMany({
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
    },
  });

  // Fetch pending orders
  const pendingOrders = await db.order.findMany({
    where: {
      status: "PENDING",
      isArchived: false,
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
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10, // Limit to 10 most recent pending orders
  });

  // Fetch critical inventory items
  const criticalInventory = await db.inventory.findMany({
    where: {
      OR: [
        { status: "OUT_OF_STOCK" },
        { quantity: { lte: 0 } },
      ],
    },
    include: {
      product: {
        include: {
          brand: true,
        },
      },
    },
    orderBy: {
      quantity: "asc", // Show lowest stock first
    },
    take: 10, // Limit to 10 most critical items
  });

  return (
    <DashboardContent
      orders={orders}
      pendingOrders={pendingOrders}
      criticalInventory={criticalInventory}
    />
  );
};

export default Page;
