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

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-32 sm:pt-32 lg:pt-36 pb-8 sm:pb-10">
      <div className="px-4 sm:px-6 lg:px-8 xl:px-40 mt-4 sm:mt-5">
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-4">Track Your Order</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Enter your order ID and email address to track your order status
          </p>
        </div>

        {/* Search Form */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderId" className="text-sm sm:text-base">Order ID</Label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter your order ID"
                  disabled={isLoading}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  className="text-sm sm:text-base"
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto text-sm sm:text-base">
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? "Searching..." : "Track Order"}
            </Button>
          </form>
          {error && (
            <div className="mt-4 p-3 sm:p-4 bg-destructive/10 text-destructive rounded-md text-sm sm:text-base">
              {error}
            </div>
          )}
        </Card>

        {/* Order Details */}
        {order && (
          <div className="grid lg:grid-cols-10 gap-4 sm:gap-6">
            {/* Left Column - Order Status & Items */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 order-2 lg:order-1">
              {/* Order Status Timeline */}
              <Card className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Order Status</h2>
                <div
                  className={`grid ${
                    order.orderOption === "delivery"
                      ? "sm:grid-cols-2 lg:grid-cols-4"
                      : "sm:grid-cols-2 lg:grid-cols-3"
                  } grid-cols-1 gap-4 sm:gap-6 lg:gap-10`}
                >
                  {getOrderSteps().map((step, index) => {
                    const currentStatusIndex = getOrderSteps().findIndex(
                      (s) => s.status === order.status
                    );
                    const isActive = index <= currentStatusIndex;

                    return (
                      <div
                        key={step.id}
                        className={`flex w-full relative tracking-panel gap-2 sm:gap-4 items-center p-2 sm:p-3 rounded ${
							isActive ? "bg-[#f7e2e2] active" : "bg-zinc-100"
						  }`}
                      >
                        <div className="relative size-8 sm:size-10 flex-shrink-0">
                          <Image
                            src={step.image}
                            alt={step.label}
                            fill
                            className={`size-full ${isActive ? "text-primary" : "text-gray-400"}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm sm:text-base font-semibold ${isActive ? "text-primary" : "text-gray-600"}`}
                          >
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {formatDate(step.date)}
                            </p>
                          )}
                          {!step.date && isActive && (
                            <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Order Items */}
              <Card className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold">Order Items</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground truncate">Order #{order.id.slice(0, 12)}...</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(order.id)}
                      className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                    >
                      <CopyIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium">Image</th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium">Unit Price</th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium">Quantity</th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium">Subtotal</th>
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
                              <p className="font-medium text-sm sm:text-base">{item.product.name}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {item.product.brand.name}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs sm:text-sm">₱{formatCurrency(item.price)}</td>
                          <td className="py-4 px-4 text-xs sm:text-sm">x{item.quantity}</td>
                          <td className="py-4 px-4 font-medium text-xs sm:text-sm">
                            ₱{formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-4">
                  {order.orderItem.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground mb-2">{item.product.brand.name}</p>
                        <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                          <span>Unit: ₱{formatCurrency(item.price)}</span>
                          <span>Qty: x{item.quantity}</span>
                        </div>
                        <p className="font-semibold text-sm">₱{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Summary & Customer Info */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-6 order-1 lg:order-2">
              {/* Order Summary */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Order Summary</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm">
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
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-green-600">
                        -₱{formatCurrency(order.discountedAmount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 sm:pt-3 flex justify-between">
                    <span className="font-bold text-sm sm:text-base">Total</span>
                    <span className="font-bold text-base sm:text-lg">₱{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </Card>

              {/* Customer Details */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                  Order Details
                </h3>
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-muted-foreground block mb-1">Order Date</span>
                      <span className="font-medium break-words">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-muted-foreground block mb-1">Preferred Date</span>
                      <span className="font-medium break-words">{formatDate(order.preferredDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-muted-foreground block mb-1">Order Option</span>
                      <span className="font-medium capitalize break-words">{order.orderOption}</span>
                    </div>
                  </div>
				  <div className="flex items-start gap-2 sm:gap-3">
                    <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-muted-foreground block mb-1">Payment Status</span>
                      <span className="font-medium capitalize break-words">{order.paymentStatus.toLowerCase()}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Customer Information */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                  Customer Information
                </h3>
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Name</span>
                    <span className="font-medium break-words">{order.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Email</span>
                    <span className="font-medium break-words">{order.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-muted-foreground block mb-1">Phone</span>
                      <span className="font-medium break-words">{order.phoneNumber}</span>
                    </div>
                  </div>
                  {order.remarks && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Remarks</span>
                      <span className="font-medium break-words">{order.remarks}</span>
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
