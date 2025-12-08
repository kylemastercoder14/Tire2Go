/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from "react";
import { OrderWithOrderItem } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, Calendar, MapPin, Eye, CopyIcon, XCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CancelOrderDialog } from "./cancel-order-dialog";

interface OrderHistoryClientProps {
  orders: OrderWithOrderItem[];
}

const OrderHistoryClient = ({ orders }: OrderHistoryClientProps) => {
  const router = useRouter();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleCancelClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCancelDialogOpen(true);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setSelectedOrderId(null);
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Order ID copied to clipboard");
  };

  const handleViewDetails = (orderId: string) => {
    router.push(`/order-history/${orderId}`);
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] pt-24 sm:pt-32 lg:pt-36 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-4">Order History</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View all your past and current orders
            </p>
          </div>
          <Card className="p-6 sm:p-8 lg:p-12 text-center">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <Button onClick={() => router.push("/")} className="w-full sm:w-auto">
              Start Shopping
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] lg:pt-36 pt-38 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-4">Order History</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View all your past and current orders ({orders.length} {orders.length === 1 ? 'order' : 'orders'})
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Left Section - Order Info */}
                <div className="flex-1 space-y-3 sm:space-y-4">
                  {/* Order Header */}
                  <div className="flex items-start justify-between flex-wrap gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold">Order #{order.id.slice(0, 8)}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(order.id)}
                        className="h-7 w-7 sm:h-8 sm:w-8"
                      >
                        <CopyIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${getStatusColor(order.status)} text-xs sm:text-sm`}>
                        {order.status}
                      </Badge>
                      <Badge className={`${getPaymentStatusColor(order.paymentStatus)} text-xs sm:text-sm`}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="space-y-2">
                    {order.orderItem.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 sm:gap-3">
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium truncate">{item.product.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {item.product.brand.name} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm sm:text-base font-medium">
                            ₱{formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.orderItem.length > 3 && (
                      <p className="text-xs sm:text-sm text-muted-foreground pl-14 sm:pl-20">
                        +{order.orderItem.length - 3} more item{order.orderItem.length - 3 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <span className="capitalize">{order.orderOption}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <span>Preferred: {formatDate(order.preferredDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Section - Total & Actions */}
                <div className="lg:w-64 flex flex-col justify-between gap-3 sm:gap-4 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="font-medium">
                        {order.orderItem.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                    {order.discountedAmount && order.discountedAmount > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Discount:</span>
                        <span className="font-medium text-green-600">
                          -₱{formatCurrency(order.discountedAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span>₱{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleViewDetails(order.id)}
                      className="w-full text-xs sm:text-sm"
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      View Details
                    </Button>
                    {order.status === "PENDING" && (
                      <Button
                        onClick={() => handleCancelClick(order.id)}
                        className="w-full text-xs sm:text-sm"
                        variant="destructive"
                        size="sm"
                      >
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Cancel Order Dialog */}
      {selectedOrderId && (
        <CancelOrderDialog
          isOpen={cancelDialogOpen}
          onClose={handleCancelDialogClose}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
};

export default OrderHistoryClient;
