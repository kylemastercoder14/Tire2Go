import React from "react";
import db from "@/lib/db";
import { SoldChart } from "./_components/orders-chart";
import { BrandChart } from "./_components/brand-chart";
import { ProductChart } from "./_components/product-chart";
import StatsDashboard from "./_components/stats-dashboard";

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
  return (
    <div>
      <StatsDashboard />
      <div className="mt-5">
        <SoldChart orders={orders} />
      </div>
      <div className="mt-5 grid lg:grid-cols-2 grid-cols-1 gap-5">
        <BrandChart orders={orders} />
        <ProductChart orders={orders} />
      </div>
    </div>
  );
};

export default Page;
