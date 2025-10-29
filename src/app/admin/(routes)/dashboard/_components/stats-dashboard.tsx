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
  "weekly",
  "monthly",
  "quarterly",
  "semiAnnual",
  "annual",
];

const StatsDashboard = () => {
  const [period, setPeriod] = useState<Period>("monthly");
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stats?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [period]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-2xl font-bold tracking-tight">
          Analytics Overview
        </h3>
        <div className="flex items-center gap-2">
          <label className="mb-1 block font-semibold">Select Period:</label>
          <Select
            value={period}
            onValueChange={(val) => setPeriod(val as Period)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p) => (
                <SelectItem key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-4 grid-cols-1 gap-5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="space-y-2 p-4 border rounded-lg shadow-sm"
            >
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
