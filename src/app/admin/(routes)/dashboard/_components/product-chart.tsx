"use client";

import React from "react";
import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { OrderWithOrderItem } from "@/types";

type ProductChartProps = {
  orders: OrderWithOrderItem[];
};

export function ProductChart({ orders }: ProductChartProps) {
  // Generate top 5 products dynamically
  const chartData = React.useMemo(() => {
    const productMap: Record<string, { soldCount: number; fill: string }> = {};
    const colors = [
      "#ffd700",
      "#556b2f",
      "#8b4513",
      "#9932cc",
      "#8b0000",
    ];

    let colorIndex = 0;

    orders.forEach((order) => {
      if (order.status === "COMPLETED") {
        order.orderItem.forEach((item) => {
          const productName = item.product.name;
          if (!productMap[productName])
            productMap[productName] = { soldCount: 0, fill: colors[colorIndex % colors.length] };
          productMap[productName].soldCount += item.quantity;
          colorIndex++;
        });
      }
    });

    return Object.entries(productMap)
      .map(([product, { soldCount, fill }]) => ({ product, soldCount, fill }))
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5); // top 5 products
  }, [orders]);

  const chartConfig = React.useMemo(
    () =>
      chartData.reduce((acc, cur) => {
        acc[cur.product] = { label: cur.product, color: cur.fill };
        return acc;
      }, {} as ChartConfig),
    [chartData]
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Top 5 Products</CardTitle>
        <CardDescription>
          Showing top 5 products from completed orders
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] pb-0">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="soldCount"
              nameKey="product"
              outerRadius={100}
              stroke="#fff"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex items-center lg:px-40 mx-auto justify-center flex-wrap gap-4">
          {Object.entries(chartConfig).map(([key, { label, color }]) => (
            <div key={key} className="flex items-center space-x-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
