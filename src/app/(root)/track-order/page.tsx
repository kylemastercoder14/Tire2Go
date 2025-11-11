"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Search, CopyIcon, Package, MapPin, Calendar, Phone, Mail, Wallet } from "lucide-react";
import { getOrderForTracking } from "@/actions";
import { OrderWithOrderItem } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const Page = () => {
  const [orderId, setOrderId] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [order, setOrder] = React.useState<OrderWithOrderItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId.trim() || !email.trim()) {
      setError("Please enter both Order ID and Email");
      return;
    }

    setIsLoading(true);
    setError("");
    setOrder(null);

    try {
      const result = await getOrderForTracking(orderId.trim(), email.trim());

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setOrder(result.data);
      }
    } catch (err) {
      setError("Failed to fetch order. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getOrderSteps = () => {
    if (!order) return [];

    const baseSteps = [
      {
        id: "pending",
        label: "Pending",
        image:
          "https://angular.pixelstrap.com/multikart-admin/assets/svg/tracking/pending.svg",
        date: order.createdAt,
        status: "PENDING",
      },
      {
        id: "processing",
        label: "Processing",
        image:
          "https://angular.pixelstrap.com/multikart-admin/assets/svg/tracking/processing.svg",
        date: order.processingAt || undefined,
        status: "PROCESSING",
      },
    ];

    if (order.orderOption === "delivery") {
      return [
        ...baseSteps,
        {
          id: "shipped",
          label: "Shipped",
          image:
            "https://angular.pixelstrap.com/multikart-admin/assets/svg/tracking/out-for-delivery.svg",
          date: order.shippedAt || undefined,
          status: "SHIPPED",
        },
        {
          id: "completed",
          label: "Completed",
          image:
            "https://angular.pixelstrap.com/multikart-admin/assets/svg/tracking/delivered.svg",
          date: order.completedAt || undefined,
          status: "COMPLETED",
        },
      ];
    } else {
      return [
        ...baseSteps,
        {
          id: "completed",
          label: "Completed",
          image:
            "https://angular.pixelstrap.com/multikart-admin/assets/svg/tracking/delivered.svg",
          date: order.completedAt || undefined,
          status: "COMPLETED",
        },
      ];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-600";
      case "SHIPPED":
        return "bg-orange-600";
      case "PROCESSING":
        return "bg-blue-600";
      case "CANCELLED":
        return "bg-red-600";
      default:
        return "bg-yellow-600";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-600";
      case "FAILED":
        return "bg-red-600";
      default:
        return "bg-yellow-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-36 pb-10">
      <div className="px-40 mt-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Track Your Order</h1>
          <p className="text-muted-foreground">
            Enter your order ID and email address to track your order status
          </p>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter your order ID"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? "Searching..." : "Track Order"}
            </Button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}
        </Card>

        {/* Order Details */}
        {order && (
          <div className="grid lg:grid-cols-10 gap-6">
            {/* Left Column - Order Status & Items */}
            <div className="lg:col-span-7 space-y-6">
              {/* Order Status Timeline */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">Order Status</h2>
                <div
                  className={`grid ${
                    order.orderOption === "delivery" ? "lg:grid-cols-4" : "lg:grid-cols-3"
                  } grid-cols-1 gap-10`}
                >
                  {getOrderSteps().map((step, index) => {
                    const currentStatusIndex = getOrderSteps().findIndex(
                      (s) => s.status === order.status
                    );
                    const isActive = index <= currentStatusIndex;

                    return (
                      <div
                        key={step.id}
                        className={`flex w-full relative tracking-panel gap-4 items-center ${
							isActive ? "bg-[#f7e2e2] active" : "bg-zinc-100"
						  }`}
                      >
                        <div className="relative size-10">
                          <Image
                            src={step.image}
                            alt={step.label}
                            fill
                            className={`size-full ${isActive ? "text-primary" : "text-gray-400"}`}
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-base font-semibold ${isActive ? "text-primary" : "text-gray-600"}`}
                          >
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-sm text-muted-foreground">
                              {formatDate(step.date)}
                            </p>
                          )}
                          {!step.date && isActive && (
                            <p className="text-sm text-muted-foreground">Pending</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Order Items */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Order Items</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Order #{order.id}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(order.id)}
                      className="h-8 w-8"
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium">Image</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Unit Price</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Quantity</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItem.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-4 px-4">
                            <div className="relative w-16 h-16">
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.product.brand.name}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">₱{formatCurrency(item.price)}</td>
                          <td className="py-4 px-4">x{item.quantity}</td>
                          <td className="py-4 px-4 font-medium">
                            ₱{formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Right Column - Summary & Customer Info */}
            <div className="lg:col-span-3 space-y-6">
              {/* Order Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      ₱
                      {formatCurrency(
                        order.orderItem.reduce(
                          (acc, item) => acc + item.price * item.quantity,
                          0
                        )
                      )}
                    </span>
                  </div>
                  {order.discountedAmount && order.discountedAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-green-600">
                        -₱{formatCurrency(order.discountedAmount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg">₱{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </Card>

              {/* Customer Details */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block mb-1">Order Date</span>
                      <span className="font-medium">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block mb-1">Preferred Date</span>
                      <span className="font-medium">{formatDate(order.preferredDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block mb-1">Order Option</span>
                      <span className="font-medium capitalize">{order.orderOption}</span>
                    </div>
                  </div>
				  <div className="flex items-start gap-3">
                    <Wallet className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block mb-1">Payment Status</span>
                      <span className="font-medium capitalize">{order.paymentStatus.toLowerCase()}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Customer Information */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Customer Information
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Name</span>
                    <span className="font-medium">{order.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Email</span>
                    <span className="font-medium">{order.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block mb-1">Phone</span>
                      <span className="font-medium">{order.phoneNumber}</span>
                    </div>
                  </div>
                  {order.remarks && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Remarks</span>
                      <span className="font-medium">{order.remarks}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
