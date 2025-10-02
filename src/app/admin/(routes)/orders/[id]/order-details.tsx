/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { OrderWithOrderItem } from "@/types";
import Image from "next/image";
import { ArrowLeft, CopyIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/actions";
import { OrderStatus } from "@prisma/client";
import Heading from "@/components/globals/Heading";
import { toast } from 'sonner';

const OrderDetails = ({
  initialData,
}: {
  initialData: OrderWithOrderItem | null;
}) => {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = React.useState(
    initialData?.status || "PENDING"
  );
  const [loading, setLoading] = React.useState(false);
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

  const handleStatusChange = async (value: OrderStatus) => {
    setOrderStatus(value);
    setLoading(true);

    await updateOrderStatus(initialData.id, value);
    router.refresh();
	toast.success("Order status updated");
    setLoading(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <Heading title="Order Details" description="" />
      </div>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="text-center">
            <Loader2 className="size-18 animate-spin mx-auto" />
            <h3 className="text-lg font-semibold mb-3 mt-5 text-black">
              Please wait while we update the order status
            </h3>
            <p className="text-gray-700">It may take a while</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-10 mt-5 grid-cols-1 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-7">
          {/* Order Status Steps */}
          <div className="mb-6">
            <div
              className={`grid ${initialData.orderOption === "delivery" ? "lg:grid-cols-4" : "lg:grid-cols-3"} grid-cols-1 gap-10`}
            >
              {orderSteps.map((step) => {
                const isActive =
                  step.id.toLowerCase() === initialData.status.toLowerCase();

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
                          className={`size-full ${isActive ? "text-primary" : "text-gray-400"}`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-base font-semibold ${isActive ? "text-primary" : "text-gray-600"}`}
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
          </div>
          <div className="bg-white border shadow rounded-sm py-3 px-5">
            {/* Top Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-black">
                  Order Number: {initialData.id}
                </h2>
                <Button onClick={() => handleCopy(initialData.id)} variant="ghost" size="icon">
                  <CopyIcon className="size-4 text-gray-500" />
                </Button>
              </div>
              <Select
                defaultValue={orderStatus}
                onValueChange={handleStatusChange}
                disabled={loading}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  {initialData.orderOption === "delivery" && (
					<SelectItem value="SHIPPED">Shipped</SelectItem>
				  )}
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
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
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {item.product.name}
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
          </div>
        </div>
        {/* Right Column */}
        <div className="lg:col-span-3">
          <div className="bg-white border shadow rounded-sm py-3 px-5">
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
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-gray-900">
                  ₱{formatCurrency(initialData.discountedAmount ?? 0)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-lg text-gray-900">
                  ₱{formatCurrency(initialData.totalAmount)}
                </span>
              </div>
            </div>
            <h3 className="text-base font-bold text-black mb-4">
              Customer Details
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">Name:</span>
                <span className="text-gray-900">{initialData.name}</span>
              </div>

              <div>
                <span className="text-gray-500 block mb-1">Email Address:</span>
                <span className="text-gray-900">{initialData.email}</span>
              </div>

              <div>
                <span className="text-gray-500 block mb-1">Phone Number:</span>
                <span className="text-gray-900">{initialData.phoneNumber}</span>
              </div>

              <div>
                <span className="text-gray-500 block mb-1">
                  Preferred Date:
                </span>
                <div className="text-gray-900">
                  <div>{formatDate(initialData.preferredDate)}</div>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block mb-1">Order Option:</span>
                <div className="text-gray-900">
                  <div>{initialData.orderOption}</div>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block mb-1">Remarks:</span>
                <div className="text-gray-900">
                  <div>{initialData.remarks || "No remarks provided"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
