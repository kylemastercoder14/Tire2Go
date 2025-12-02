/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { OrderWithOrderItem } from "@/types";
import Image from "next/image";
import { ArrowLeft, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Package, Calendar, MapPin, Phone, Mail, Wallet } from "lucide-react";

const OrderDetailsUser = ({
  initialData,
}: {
  initialData: OrderWithOrderItem | null;
}) => {
  const router = useRouter();

  if (!initialData) {
    return <div>No order details available</div>;
  }

  const orderStepsDelivery = [
    {
      id: "pending",
      label: "Pending",
      image:
        "https://angular.pixelstrap.com/multikart-admin/assets/svg/tracking/pending.svg",
      date: initialData.createdAt,
    },
    {
      id: "processing",
      label: "Processing",
      image:
        "https://angular.pixelstrap.com/multikart-admin/assets/svg/tracking/processing.svg",
      date: initialData.processingAt || undefined,
    },
    {
      id: "shipped",
      label: "Shipped",
      image:
        "https://angular.pixelstrap.com/multikart-admin/assets/svg/tracking/out-for-delivery.svg",
      date: initialData.shippedAt || undefined,
    },
    {
      id: "completed",
      label: "Completed",
      image:
        "https://angular.pixelstrap.com/multikart-admin/assets/svg/tracking/delivered.svg",
      date: initialData.completedAt || undefined,
    },
  ];

  const orderStepsInstallation = [
    {
      id: "pending",
      label: "Pending",
      image:
        "https://angular.pixelstrap.com/multikart-admin/assets/svg/tracking/pending.svg",
      date: initialData.createdAt,
    },
    {
      id: "processing",
      label: "Processing",
      image:
        "https://angular.pixelstrap.com/multikart-admin/assets/svg/tracking/processing.svg",
      date: initialData.processingAt || undefined,
    },
    {
      id: "completed",
      label: "Completed",
      image:
        "https://angular.pixelstrap.com/multikart-admin/assets/svg/tracking/delivered.svg",
      date: initialData.completedAt || undefined,
    },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const orderSteps =
    initialData.orderOption === "delivery"
      ? orderStepsDelivery
      : orderStepsInstallation;

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
    <>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-3xl font-bold">Order Details</h1>
      </div>

      <div className="grid lg:grid-cols-10 mt-5 grid-cols-1 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-7">
          {/* Order Status Steps */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Order Status</h2>
            <div
              className={`grid ${
                initialData.orderOption === "delivery"
                  ? "lg:grid-cols-4"
                  : "lg:grid-cols-3"
              } grid-cols-1 gap-10`}
            >
              {orderSteps.map((step, index) => {
                const currentStatusIndex = orderSteps.findIndex(
                  (s) => s.id.toLowerCase() === initialData.status.toLowerCase()
                );
                const isActive = index <= currentStatusIndex;

                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={`flex w-full relative tracking-panel gap-4 items-center ${
                        isActive ? "bg-[#f7e2e2] active" : "bg-zinc-100"
                      }`}
                    >
                      <div className="relative size-10">
                        <Image
                          src={step.image}
                          alt={step.label}
                          fill
                          className={`size-full ${
                            isActive ? "text-primary" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-base font-semibold ${
                            isActive ? "text-primary" : "text-gray-600"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-sm text-gray-500">
                            {formatDate(step.date)}
                          </p>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            {/* Top Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-black">
                  Order Number: {initialData.id}
                </h2>
                <Button
                  onClick={() => handleCopy(initialData.id)}
                  variant="ghost"
                  size="icon"
                >
                  <CopyIcon className="size-4 text-gray-500" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(initialData.status)}>
                  {initialData.status}
                </Badge>
                <Badge className={getPaymentStatusColor(initialData.paymentStatus)}>
                  {initialData.paymentStatus}
                </Badge>
              </div>
            </div>
            {/* Order Item Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Image
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Unit Price
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Quantity
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {initialData.orderItem.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
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
                      <td className="py-4 px-4 text-gray-700">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.product.brand.name}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        ₱{formatCurrency(item.price)}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        x{item.quantity}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        ₱{formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        {/* Right Column */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <h3 className="text-base font-bold text-black mb-4">Summary</h3>
            {/* Summary Details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  ₱
                  {formatCurrency(
                    initialData.orderItem.reduce(
                      (acc, item) => acc + item.price * item.quantity,
                      0
                    )
                  )}
                </span>
              </div>
              {initialData.discountedAmount && initialData.discountedAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -₱{formatCurrency(initialData.discountedAmount)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-lg text-gray-900">
                  ₱{formatCurrency(initialData.totalAmount)}
                </span>
              </div>
            </div>
            <h3 className="text-base font-bold text-black mb-4">
              Order Details
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-gray-500 block mb-1">Order Date:</span>
                  <span className="text-gray-900">
                    {formatDate(initialData.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-gray-500 block mb-1">
                    Preferred Date:
                  </span>
                  <span className="text-gray-900">
                    {formatDate(initialData.preferredDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-gray-500 block mb-1">Order Option:</span>
                  <span className="text-gray-900 capitalize">
                    {initialData.orderOption}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-gray-500 block mb-1">
                    Payment Status:
                  </span>
                  <span className="text-gray-900 capitalize">
                    {initialData.paymentStatus.toLowerCase()}
                  </span>
                </div>
              </div>

              {initialData.remarks && (
                <div>
                  <span className="text-gray-500 block mb-1">Remarks:</span>
                  <span className="text-gray-900">{initialData.remarks}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsUser;
