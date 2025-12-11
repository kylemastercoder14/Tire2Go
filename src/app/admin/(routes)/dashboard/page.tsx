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

    if (!user || user.userType !== UserType.ADMIN) {
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
  return <DashboardContent orders={orders} />;
};

export default Page;
