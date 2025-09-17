"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A radar chart"

const chartData = [
  { brand: "Dunlop", sold: 305 },
  { brand: "Yokohama", sold: 273 },
  { brand: "Michelin", sold: 237 },
  { brand: "Raiden", sold: 214 },
  { brand: "Comforser", sold: 209 },
  { brand: "Monsta", sold: 186 },
]

const chartConfig = {
  sold: {
    label: "Sold",
    color: "#ac0000",
  },
} satisfies ChartConfig

export function BrandChart() {
  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Top 5 Brands</CardTitle>
        <CardDescription>
          Showing top 5 brands for the last 6 months
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
            <Radar
              dataKey="sold"
              fill="var(--color-sold)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          March - September 2025
        </div>
      </CardFooter>
    </Card>
  )
}
