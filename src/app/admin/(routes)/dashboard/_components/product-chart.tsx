"use client";

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

const chartData = [
  { product: "premioArz1", soldCount: 275, fill: "var(--chart-1)" },
  { product: "primacy4Suv", soldCount: 200, fill: "var(--chart-2)" },
  { product: "advana052", soldCount: 187, fill: "var(--chart-3)" },
  { product: "alliance030Ex", soldCount: 173, fill: "var(--chart-4)" },
  { product: "heroR111", soldCount: 90, fill: "var(--chart-5)" },
];

const chartConfig = {
  premioArz1: {
    label: "PREMIO ARZ 1",
    color: "var(--chart-1)",
  },
  primacy4Suv: {
    label: "Primacy 4 SUV",
    color: "var(--chart-2)",
  },
  advana052: {
    label: "ADVAN A052",
    color: "var(--chart-3)",
  },
  alliance030Ex: {
    label: "Alliance 030Ex",
    color: "var(--chart-4)",
  },
  heroR111: {
    label: "HERO R111",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function ProductChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Top 5 Tires</CardTitle>
        <CardDescription>
          Showing top 5 tires for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0"
        >
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
        {/* ✅ Custom Legend */}
        <div className="flex items-center lg:px-40 mx-auto justify-center flex-wrap gap-4">
          {Object.entries(chartConfig).map(([key, { label, color }]) => (
            <div key={key} className="flex items-center space-x-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
