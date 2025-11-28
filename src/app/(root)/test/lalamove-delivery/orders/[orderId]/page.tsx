"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Package, Phone, User, Calendar } from "lucide-react";
import { toast } from "sonner";

interface OrderDetails {
  data: {
    orderId: string;
    status: string;
    price: string;
    driver?: {
      name: string;
      phone: string;
      vehicleType: string;
      plateNumber: string;
    };
    stops: Array<{
      coordinates: { lat: string; lng: string };
      address: string;
      contactName: string;
      contactPhone: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/test/lalamove/order/${orderId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch order details");
      }

      const result = await response.json();
      setOrder(result);
    } catch (error: any) {
      console.error("Error fetching order details:", error);
      toast.error(error.message || "Failed to fetch order details");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrderDetails();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNING_DRIVER":
        return "bg-yellow-100 text-yellow-800";
      case "ON_GOING":
        return "bg-blue-100 text-blue-800";
      case "PICKED_UP":
        return "bg-purple-100 text-purple-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading order details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Order not found</p>
              <Button onClick={() => window.location.href = "/test/lalamove-delivery"}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Order Tracking
            </h1>
            <p className="text-gray-600">Track your delivery in real-time</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Order Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order #{order.data.orderId}</CardTitle>
                  <CardDescription>
                    Created: {new Date(order.data.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(order.data.status)}>
                  {order.data.status.replace(/_/g, " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Price</span>
                <span className="text-2xl font-bold text-primary">
                  ₱{parseFloat(order.data.price || "0").toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Driver Information */}
          {order.data.driver && (
            <Card>
              <CardHeader>
                <CardTitle>Driver Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.data.driver.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.data.driver.vehicleType} • {order.data.driver.plateNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a
                    href={`tel:${order.data.driver.phone}`}
                    className="text-primary hover:underline"
                  >
                    {order.data.driver.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Route */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Route</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {order.data.stops.map((stop, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        index === 0
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index < order.data.stops.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300 my-2" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {index === 0 ? "Pickup Location" : "Delivery Location"}
                        </p>
                        <p className="text-sm text-muted-foreground">{stop.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{stop.contactName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`tel:${stop.contactPhone}`}
                          className="text-primary hover:underline"
                        >
                          {stop.contactPhone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => window.location.href = "/test/lalamove-delivery"}
              variant="outline"
            >
              Create New Delivery
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

