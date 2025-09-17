"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

const chartData = [
  { date: "2024-04-01", completed: 222, cancelled: 150 },
  { date: "2024-04-02", completed: 97, cancelled: 180 },
  { date: "2024-04-03", completed: 167, cancelled: 120 },
  { date: "2024-04-04", completed: 242, cancelled: 260 },
  { date: "2024-04-05", completed: 373, cancelled: 290 },
  { date: "2024-04-06", completed: 301, cancelled: 340 },
  { date: "2024-04-07", completed: 245, cancelled: 180 },
  { date: "2024-04-08", completed: 409, cancelled: 320 },
  { date: "2024-04-09", completed: 59, cancelled: 110 },
  { date: "2024-04-10", completed: 261, cancelled: 190 },
  { date: "2024-04-11", completed: 327, cancelled: 350 },
  { date: "2024-04-12", completed: 292, cancelled: 210 },
  { date: "2024-04-13", completed: 342, cancelled: 380 },
  { date: "2024-04-14", completed: 137, cancelled: 220 },
  { date: "2024-04-15", completed: 120, cancelled: 170 },
  { date: "2024-04-16", completed: 138, cancelled: 190 },
  { date: "2024-04-17", completed: 446, cancelled: 360 },
  { date: "2024-04-18", completed: 364, cancelled: 410 },
  { date: "2024-04-19", completed: 243, cancelled: 180 },
  { date: "2024-04-20", completed: 89, cancelled: 150 },
  { date: "2024-04-21", completed: 137, cancelled: 200 },
  { date: "2024-04-22", completed: 224, cancelled: 170 },
  { date: "2024-04-23", completed: 138, cancelled: 230 },
  { date: "2024-04-24", completed: 387, cancelled: 290 },
  { date: "2024-04-25", completed: 215, cancelled: 250 },
  { date: "2024-04-26", completed: 75, cancelled: 130 },
  { date: "2024-04-27", completed: 383, cancelled: 420 },
  { date: "2024-04-28", completed: 122, cancelled: 180 },
  { date: "2024-04-29", completed: 315, cancelled: 240 },
  { date: "2024-04-30", completed: 454, cancelled: 380 },
  { date: "2024-05-01", completed: 165, cancelled: 220 },
  { date: "2024-05-02", completed: 293, cancelled: 310 },
  { date: "2024-05-03", completed: 247, cancelled: 190 },
  { date: "2024-05-04", completed: 385, cancelled: 420 },
  { date: "2024-05-05", completed: 481, cancelled: 390 },
  { date: "2024-05-06", completed: 498, cancelled: 520 },
  { date: "2024-05-07", completed: 388, cancelled: 300 },
  { date: "2024-05-08", completed: 149, cancelled: 210 },
  { date: "2024-05-09", completed: 227, cancelled: 180 },
  { date: "2024-05-10", completed: 293, cancelled: 330 },
  { date: "2024-05-11", completed: 335, cancelled: 270 },
  { date: "2024-05-12", completed: 197, cancelled: 240 },
  { date: "2024-05-13", completed: 197, cancelled: 160 },
  { date: "2024-05-14", completed: 448, cancelled: 490 },
  { date: "2024-05-15", completed: 473, cancelled: 380 },
  { date: "2024-05-16", completed: 338, cancelled: 400 },
  { date: "2024-05-17", completed: 499, cancelled: 420 },
  { date: "2024-05-18", completed: 315, cancelled: 350 },
  { date: "2024-05-19", completed: 235, cancelled: 180 },
  { date: "2024-05-20", completed: 177, cancelled: 230 },
  { date: "2024-05-21", completed: 82, cancelled: 140 },
  { date: "2024-05-22", completed: 81, cancelled: 120 },
  { date: "2024-05-23", completed: 252, cancelled: 290 },
  { date: "2024-05-24", completed: 294, cancelled: 220 },
  { date: "2024-05-25", completed: 201, cancelled: 250 },
  { date: "2024-05-26", completed: 213, cancelled: 170 },
  { date: "2024-05-27", completed: 420, cancelled: 460 },
  { date: "2024-05-28", completed: 233, cancelled: 190 },
  { date: "2024-05-29", completed: 78, cancelled: 130 },
  { date: "2024-05-30", completed: 340, cancelled: 280 },
  { date: "2024-05-31", completed: 178, cancelled: 230 },
  { date: "2024-06-01", completed: 178, cancelled: 200 },
  { date: "2024-06-02", completed: 470, cancelled: 410 },
  { date: "2024-06-03", completed: 103, cancelled: 160 },
  { date: "2024-06-04", completed: 439, cancelled: 380 },
  { date: "2024-06-05", completed: 88, cancelled: 140 },
  { date: "2024-06-06", completed: 294, cancelled: 250 },
  { date: "2024-06-07", completed: 323, cancelled: 370 },
  { date: "2024-06-08", completed: 385, cancelled: 320 },
  { date: "2024-06-09", completed: 438, cancelled: 480 },
  { date: "2024-06-10", completed: 155, cancelled: 200 },
  { date: "2024-06-11", completed: 92, cancelled: 150 },
  { date: "2024-06-12", completed: 492, cancelled: 420 },
  { date: "2024-06-13", completed: 81, cancelled: 130 },
  { date: "2024-06-14", completed: 426, cancelled: 380 },
  { date: "2024-06-15", completed: 307, cancelled: 350 },
  { date: "2024-06-16", completed: 371, cancelled: 310 },
  { date: "2024-06-17", completed: 475, cancelled: 520 },
  { date: "2024-06-18", completed: 107, cancelled: 170 },
  { date: "2024-06-19", completed: 341, cancelled: 290 },
  { date: "2024-06-20", completed: 408, cancelled: 450 },
  { date: "2024-06-21", completed: 169, cancelled: 210 },
  { date: "2024-06-22", completed: 317, cancelled: 270 },
  { date: "2024-06-23", completed: 480, cancelled: 530 },
  { date: "2024-06-24", completed: 132, cancelled: 180 },
  { date: "2024-06-25", completed: 141, cancelled: 190 },
  { date: "2024-06-26", completed: 434, cancelled: 380 },
  { date: "2024-06-27", completed: 448, cancelled: 490 },
  { date: "2024-06-28", completed: 149, cancelled: 200 },
  { date: "2024-06-29", completed: 103, cancelled: 160 },
  { date: "2024-06-30", completed: 446, cancelled: 400 },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  completed: {
    label: "Completed",
    color: "var(--primary)",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function SoldChart() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Orders</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
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
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
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
                  stopOpacity={1.0}
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
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="completed"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="cancelled"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
