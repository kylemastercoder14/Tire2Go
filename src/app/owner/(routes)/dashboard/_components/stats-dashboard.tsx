/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import StatsCard from "./stats-card";
import { Period } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const periods: Period[] = [
  "Weekly",
  "Monthly",
  "Quarterly",
  "Semi Anually",
  "Annually",
];

interface StatsDashboardProps {
  onDataChange?: (data: any[]) => void;
  period: Period;
}

const StatsDashboard = ({ onDataChange, period }: StatsDashboardProps) => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stats?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
        onDataChange?.(data); // ✅ send stats to parent
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [period, onDataChange]);

  return (
    <div>

      {loading ? (
        <div className="grid lg:grid-cols-4 grid-cols-1 gap-5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-2 p-4 border rounded-lg shadow-sm">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 grid-cols-1 gap-5">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StatsDashboard;
