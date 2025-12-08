/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SoldChart } from "./_components/orders-chart";
import { BrandChart } from "./_components/brand-chart";
import { ProductChart } from "./_components/product-chart";
import StatsDashboard from "./_components/stats-dashboard";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Period } from "@/lib/api";
import { useUser } from "@clerk/nextjs";

const periods: Period[] = [
  "Weekly",
  "Monthly",
  "Quarterly",
  "Semi Anually",
  "Annually",
];

const DashboardContent = ({ orders }: { orders: any }) => {
  const { user } = useUser();
  const [statData, setStatData] = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>("Monthly");

  // Get date range based on selected period
  const getPeriodDateRange = (selectedPeriod: Period) => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (selectedPeriod) {
      case "Weekly": {
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "Monthly": {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      }
      case "Quarterly": {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
        break;
      }
      case "Semi Anually": {
        const half = now.getMonth() < 6 ? 0 : 6;
        startDate = new Date(now.getFullYear(), half, 1);
        endDate = new Date(now.getFullYear(), half + 6, 0, 23, 59, 59, 999);
        break;
      }
      case "Annually": {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      }
      default: {
        // Fallback to last 30 days
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        endDate = new Date();
        break;
      }
    }

    return { startDate, endDate };
  };

  // Extract chart data from orders based on selected period
  const chartData = useMemo(() => {
    const { startDate, endDate } = getPeriodDateRange(period);

    // Sales data by date (filtered by selected period)
    const salesMap: Record<string, { completed: number; cancelled: number; profit: number; loss: number }> = {};

    orders.forEach((o: any) => {
      const orderDate = new Date(o.createdAt);

      // Only include orders within the selected period
      if (orderDate < startDate || orderDate > endDate) return;

      const date = orderDate.toISOString().split("T")[0];

      if (!salesMap[date]) {
        salesMap[date] = { completed: 0, cancelled: 0, profit: 0, loss: 0 };
      }

      if (o.status === "COMPLETED") {
        salesMap[date].completed += 1;
        // Calculate profit from completed orders
        const orderTotal = o.discountedAmount ?? o.totalAmount;
        salesMap[date].profit += orderTotal;
      } else if (o.status === "CANCELLED") {
        salesMap[date].cancelled += 1;
      }
    });

    const salesStateData = Object.entries(salesMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Top 5 brands (filtered by period)
    const brandMap: Record<string, number> = {};
    orders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt);
      if (order.status === "COMPLETED" && orderDate >= startDate && orderDate <= endDate) {
        order.orderItem.forEach((item: any) => {
          const brandName = item.product.brand.name;
          if (!brandMap[brandName]) brandMap[brandName] = 0;
          brandMap[brandName] += item.quantity;
        });
      }
    });
    const topBrands = Object.entries(brandMap)
      .map(([brand, sold]) => ({ brand, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // Top 5 products (filtered by period)
    const productMap: Record<string, number> = {};
    orders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt);
      if (order.status === "COMPLETED" && orderDate >= startDate && orderDate <= endDate) {
        order.orderItem.forEach((item: any) => {
          const productName = item.product.name;
          if (!productMap[productName]) productMap[productName] = 0;
          productMap[productName] += item.quantity;
        });
      }
    });
    const topProducts = Object.entries(productMap)
      .map(([product, sold]) => ({ product, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    return { salesStateData, topBrands, topProducts };
  }, [orders, period]);

  const handlePrint = () => {
    if (statData.length === 0) {
      alert("Please wait for statistics to load before printing.");
      return;
    }

    const printWindow = window.open("about:blank", "_blank", "width=800,height=600");
    if (!printWindow) return;

    // Change document title to prevent showing "about:blank"
    printWindow.document.title = "Dashboard Report - 202 Mags and Tires Collections";

    // Get date range for the selected period
    const { startDate, endDate } = getPeriodDateRange(period);
    const dateRangeLabel = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

    // Find the stat objects by their exact titles
    const revenue = statData.find(s => s.title === 'Total Revenue');
    const customers = statData.find(s => s.title === 'New Customers');
    const tiresSold = statData.find(s => s.title === 'Tires Sold');
    const inventory = statData.find(s => s.title === 'Inventory Turnover');

    // HTML and inline styles for printing
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>202 Mags and Tires Collections - Dashboard Report</title>
  <meta charset="utf-8">
  <style>
    @page {
      margin: 1cm;
      size: A4;
      @top-left { content: ""; }
      @top-center { content: ""; }
      @top-right { content: ""; }
      @bottom-left { content: ""; }
      @bottom-center { content: ""; }
      @bottom-right { content: ""; }
    }
    @media print {
      @page {
        margin: 1cm;
        size: A4;
        @top-left { content: ""; }
        @top-center { content: ""; }
        @top-right { content: ""; }
        @bottom-left { content: ""; }
        @bottom-center { content: ""; }
        @bottom-right { content: ""; }
      }
      body {
        margin: 0;
        padding: 0;
      }
      .footer-info {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        padding: 10px;
        font-size: 11px;
        color: #666;
        border-top: 1px solid #ddd;
        background: white;
      }
    }
    body {
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
      color: #000;
      background: #fff;
      padding: 20px;
      padding-bottom: 80px;
      line-height: 1.5;
    }
    h1, h2 {
      font-weight: bold;
      text-align: center;
    }
    h1 { font-size: 28px; margin-bottom: 8px; }
    h2 { font-size: 20px; margin-top: 30px; border-bottom: 2px solid #000; padding-bottom: 4px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .page-break {
      page-break-after: always;
    }
    .text-center { text-align: center; }
    .text-sm { font-size: 12px; color: #666; }
    .mt-8 { margin-top: 32px; }
    .pt-4 { padding-top: 16px; }
    .border-t { border-top: 1px solid #ddd; }
    .footer-info {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      padding: 10px;
      font-size: 11px;
      color: #666;
      border-top: 1px solid #ddd;
      background: white;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <h1>202 Mags and Tires Collections</h1>
    <p class="text-center text-sm">Period: ${dateRangeLabel}</p>

    <h2>Statistics Overview</h2>
    <table>
      <thead>
        <tr><th>Metric</th><th>Value</th><th>Trend</th><th>Change</th></tr>
      </thead>
      <tbody>
        ${revenue ? `
        <tr>
          <td>${revenue.title}</td>
          <td>${revenue.data}</td>
          <td>${revenue.trend || 'N/A'}</td>
          <td>${revenue.percentage || 0}%</td>
        </tr>
        ` : ''}
        ${customers ? `
        <tr>
          <td>${customers.title}</td>
          <td>${customers.data}</td>
          <td>${customers.trend || 'N/A'}</td>
          <td>${customers.percentage || 0}%</td>
        </tr>
        ` : ''}
        ${tiresSold ? `
        <tr>
          <td>${tiresSold.title}</td>
          <td>${tiresSold.data}</td>
          <td>${tiresSold.trend || 'N/A'}</td>
          <td>${tiresSold.percentage || 0}%</td>
        </tr>
        ` : ''}
        ${inventory ? `
        <tr>
          <td>${inventory.title}</td>
          <td>${inventory.data}</td>
          <td>${inventory.trend || 'N/A'}</td>
          <td>${inventory.percentage || 0}%</td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <h2>Sales Report Summary (${period} Period)</h2>
    <table>
      <thead>
        <tr><th>Date</th><th>Completed</th><th>Cancelled</th><th>Revenue (₱)</th></tr>
      </thead>
      <tbody>
        ${chartData.salesStateData.length > 0 ? chartData.salesStateData
          .map(
            (day) => `
          <tr>
            <td>${new Date(day.date).toLocaleDateString()}</td>
            <td>${day.completed}</td>
            <td>${day.cancelled}</td>
            <td>₱${day.profit.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
          </tr>
        `
          )
          .join("") : `<tr><td colspan="4" class="text-center">No sales data for the ${period.toLowerCase()} period</td></tr>`}
        <tr style="background-color: #f5f5f5; font-weight: bold;">
          <td>Total</td>
          <td>${chartData.salesStateData.reduce((sum, day) => sum + day.completed, 0)}</td>
          <td>${chartData.salesStateData.reduce((sum, day) => sum + day.cancelled, 0)}</td>
          <td>₱${chartData.salesStateData.reduce((sum, day) => sum + day.profit, 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>

    <h2>Top 5 Brands</h2>
    <table>
      <thead>
        <tr><th>Brand</th><th>Units Sold</th></tr>
      </thead>
      <tbody>
        ${chartData.topBrands
          .map(
            (item) => `
          <tr>
            <td>${item.brand}</td>
            <td>${item.sold}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <h2>Top 5 Products</h2>
    <table>
      <thead>
        <tr><th>Product</th><th>Units Sold</th></tr>
      </thead>
      <tbody>
        ${chartData.topProducts
          .map(
            (item) => `
          <tr>
            <td>${item.product}</td>
            <td>${item.sold}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div class="footer-info">
      <p>This report was generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
      ${user ? `<p>Printed by: ${user.firstName || ''} ${user.lastName || ''}${user.emailAddresses?.[0]?.emailAddress ? ` (${user.emailAddresses[0].emailAddress})` : ''}</p>` : '<p>Printed by: System Administrator</p>'}
    </div>
  </div>
</body>
</html>
  `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for styles to render before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div>
      {/* Header, Print Button and Period Selector */}
      <div className="flex items-center flex-wrap gap-3 justify-between mb-5">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="font-semibold lg:block hidden">Select Period:</label>
            <Select value={period} onValueChange={(val) => setPeriod(val as Period)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700"
          >
            Print Report
          </Button>
        </div>
      </div>

      {/* Printable Section */}
      <div data-printable="true">
        <StatsDashboard onDataChange={setStatData} period={period} />
        <div className="mt-5">
          <SoldChart orders={orders} />
        </div>
        <div className="mt-5 grid lg:grid-cols-2 grid-cols-1 gap-5">
          <BrandChart orders={orders} />
          <ProductChart orders={orders} />
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
