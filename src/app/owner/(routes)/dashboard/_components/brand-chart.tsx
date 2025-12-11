"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
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
import { useMemo } from 'react';

type BrandChartProps = {
  orders: OrderWithOrderItem[];
};

const chartConfig = {
  sold: {
    label: "Sold",
    color: "#ac0000",
  },
} satisfies ChartConfig;

export function BrandChart({ orders }: BrandChartProps) {
  // Compute top 5 brands
  const chartData = useMemo(() => {
    const brandMap: Record<string, number> = {};

    orders.forEach((order) => {
      if (order.status === "COMPLETED") {
        order.orderItem.forEach((item) => {
          const brandName = item.product.brand.name;
          if (!brandMap[brandName]) brandMap[brandName] = 0;
          brandMap[brandName] += item.quantity;
        });
      }
    });

    // Convert to array and sort by sold quantity descending
    return Object.entries(brandMap)
      .map(([brand, sold]) => ({ brand, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5); // Top 5
  }, [orders]);

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Top 5 Brands</CardTitle>
        <CardDescription>
          Showing top 5 brands for completed orders
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="brand" />
            <PolarGrid />
            <Radar dataKey="sold" fill="var(--color-sold)" fillOpacity={0.6} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
