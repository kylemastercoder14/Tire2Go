"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { OrderWithOrderItem } from "@/types";

type SoldChartProps = {
  orders: OrderWithOrderItem[]; // Can type better if you want
};

const chartConfig = {
  completed: { label: "Completed", color: "#198754" },
  cancelled: { label: "Cancelled", color: "#DC3545" },
} satisfies ChartConfig;

export function SoldChart({ orders }: SoldChartProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  // Convert orders into chart data
  const chartData = React.useMemo(() => {
    const map: Record<string, { completed: number; cancelled: number }> = {};

    orders.forEach((o) => {
      // Use createdAt as the date key
      const date = new Date(o.createdAt).toISOString().split("T")[0];

      if (!map[date]) map[date] = { completed: 0, cancelled: 0 };

      if (o.status === "COMPLETED") map[date].completed += 1;
      else if (o.status === "CANCELLED") map[date].cancelled += 1;
    });

    return Object.entries(map)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [orders]);

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "7d") daysToSubtract = 7;

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return chartData.filter((d) => new Date(d.date) >= startDate);
  }, [chartData, timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Orders</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Showing total orders categorized by Completed and Cancelled status
          </span>
          <span className="@[540px]/card:hidden">Orders by status</span>
        </CardDescription>

        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
            >
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />

            {/* X-axis for date */}
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />

            {/* Y-axis for order count */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
              label={{ value: "Orders", angle: -90, position: "insideLeft" }}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="completed"
              type="natural"
              fill="#198754"
              stroke="var(--color-completed)"
              stackId="a"
            />
            <Area
              dataKey="cancelled"
              type="natural"
              fill="#DC3545"
              stroke="var(--color-cancelled)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
