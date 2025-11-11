import React from "react";
import db from "@/lib/db";
import DashboardContent from "./client";

const Page = async () => {
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
