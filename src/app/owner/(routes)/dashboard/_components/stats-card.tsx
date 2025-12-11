import React from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const StatsCard = ({
  title,
  data,
  percentage,
  trend,
  description,
  recommendation,
}: {
  title: string;
  data: string;
  percentage: string;
  trend: "up" | "down";
  description: string;
  recommendation: string;
}) => {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {data}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            {trend === "up" ? <IconTrendingUp /> : <IconTrendingDown />}
            {percentage}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {description}{" "}
          {trend === "up" ? (
            <IconTrendingUp className="size-4" />
          ) : (
            <IconTrendingDown className="size-4" />
          )}
        </div>
        <div className="text-muted-foreground">{recommendation}</div>
      </CardFooter>
    </Card>
  );
};

export default StatsCard;
