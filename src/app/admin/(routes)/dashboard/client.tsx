/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SoldChart } from "./_components/orders-chart";
import { BrandChart } from "./_components/brand-chart";
import { ProductChart } from "./_components/product-chart";
import StatsDashboard from "./_components/stats-dashboard";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from 'react';

const DashboardContent = ({ orders }: { orders: any }) => {
  const [statData, setStatData] = useState<any[]>([]);

  // Extract chart data from orders
  const chartData = useMemo(() => {
    // Get date range for filtering (last 30 days by default for print)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Sales data by date (filtered to last 30 days)
    const salesMap: Record<string, { completed: number; cancelled: number; profit: number; loss: number }> = {};

    orders.forEach((o: any) => {
      const orderDate = new Date(o.createdAt);

      // Only include orders from last 30 days
      if (orderDate < thirtyDaysAgo) return;

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

    // Top 5 brands
    const brandMap: Record<string, number> = {};
    orders.forEach((order: any) => {
      if (order.status === "COMPLETED") {
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

    // Top 5 products
    const productMap: Record<string, number> = {};
    orders.forEach((order: any) => {
      if (order.status === "COMPLETED") {
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
  }, [orders]);

  const handlePrint = () => {
    if (statData.length === 0) {
      alert("Please wait for statistics to load before printing.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

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
  <title>Dashboard Report</title>
  <meta charset="utf-8">
  <style>
    @page {
      margin: 1cm;
      size: A4;
    }
    body {
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
      color: #000;
      background: #fff;
      padding: 20px;
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
  </style>
</head>
<body>
  <div class="print-container">
    <h1>Dashboard Report</h1>
    <p class="text-center text-sm">Generated: ${new Date().toLocaleString()}</p>

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

    <h2>Sales Report Summary (Last 30 Days)</h2>
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
          .join("") : '<tr><td colspan="4" class="text-center">No sales data in the last 30 days</td></tr>'}
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

    <div class="text-center mt-8 pt-4 border-t">
      <p class="text-sm">This report was generated on ${new Date().toLocaleString()}</p>
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
      {/* Header and Print Button */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <Button
          onClick={handlePrint}
          className="bg-green-600 hover:bg-green-700"
        >
          Print Dashboard
        </Button>
      </div>

      {/* Printable Section */}
      <div data-printable="true">
        <StatsDashboard onDataChange={setStatData} />
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
