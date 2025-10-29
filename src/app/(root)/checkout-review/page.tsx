"use client";

import { useRouter } from "next/navigation";
import React from "react";
import useCart from "@/hooks/use-cart";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { placeOrder } from "@/actions";

const Page = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const {
    items,
    preferredSchedule,
    customerDetails,
    deliveryOption,
    removeAll,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex-col flex items-center justify-center">
        <Image src="/empty.svg" alt="Empty" width={300} height={300} />
        <h3 className="text-lg mt-3 font-semibold text-gray-600">
          Your cart is empty
        </h3>
        <p className="text-muted-foreground">
          Please add a product to your cart to proceed.
        </p>
      </div>
    );
  }

  const item = items[0]; // since you allow only one product
  const srpPrice = item.unitPrice;
  const srpTotal = item.unitPrice * item.quantity;
  const discountedTotal =
    (item.discountedPrice ?? item.unitPrice) * item.quantity;
  const discountAmount = srpTotal - discountedTotal;

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);
      // Ensure required fields are present
      if (!customerDetails || !deliveryOption) {
        toast.error("Missing customer details or delivery option.");
        return;
      }

      // Here you can handle the order placement logic
      const data = {
        items,
        preferredSchedule,
        customerDetails,
        deliveryOption,
        totalAmount: discountedTotal,
        discountedAmount: discountAmount,
      };

      const response = await placeOrder(data);
      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success("Order placed successfully!");
      removeAll();
      router.push("/completed");
    } catch (error) {
      console.error("Failed to place order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div
        className="w-full pt-30 h-[20vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}
      >
        {/* Steps */}
        <div className="flex items-center gap-2">
          <div className="bg-primary size-5 rounded-full flex items-center justify-center text-white text-xs font-medium">
            ✓
          </div>
          <h3 className="text-primary font-semibold text-center">CART</h3>
        </div>
        <ChevronRight className="size-4 text-white mx-5" />
        <div className="flex items-center gap-2">
          <div className="bg-primary size-5 rounded-full flex items-center justify-center text-white text-xs font-medium">
            ✓
          </div>
          <h3 className="text-primary font-semibold text-center">
            ORDER DETAILS
          </h3>
        </div>
        <ChevronRight className="size-4 text-white mx-5" />
        <div className="flex items-center gap-2">
          <div className="bg-primary size-5 rounded-full flex items-center justify-center text-white text-xs font-medium">
            3
          </div>
          <h3 className="text-primary font-semibold text-center">REVIEW</h3>
        </div>
        <ChevronRight className="size-4 text-white mx-5" />
        <div className="flex items-center gap-2">
          <div className="bg-white size-5 rounded-full flex items-center justify-center text-primary text-xs font-medium">
            4
          </div>
          <h3 className="text-white font-semibold text-center">COMPLETED</h3>
        </div>
      </div>

      {/* Main Section */}
      <section className="pt-5 px-34 pb-10">
        <div className="grid items-stretch lg:grid-cols-5 grid-cols-1">
          {/* Order Details */}
          <div className="lg:col-span-3 h-full flex flex-col">
            <div className="border shadow flex-1 flex flex-col">
              <div className="p-4 bg-primary text-white font-semibold text-lg">
                Review & Complete Your Order
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-primary font-medium">Order Details</h3>
                <Separator />
                <div className="space-y-2">
                  <div className="grid lg:grid-cols-5 grid-cols-1 gap-5">
                    <div className="lg:col-span-1">
                      <h3>Preferred Schedule:</h3>
                    </div>
                    <div className="lg:col-span-4">
                      <h3 className="font-medium">
                        {preferredSchedule
                          ? formatDate(preferredSchedule)
                          : "No schedule selected"}
                      </h3>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-5 grid-cols-1 gap-5">
                    <div className="lg:col-span-1">
                      <h3>Name:</h3>
                    </div>
                    <div className="lg:col-span-4">
                      <h3 className="font-medium">
                        {customerDetails?.firstName} {customerDetails?.lastName}
                      </h3>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-5 grid-cols-1 gap-5">
                    <div className="lg:col-span-1">
                      <h3>Email Address:</h3>
                    </div>
                    <div className="lg:col-span-4">
                      <h3 className="font-medium">{customerDetails?.email}</h3>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-5 grid-cols-1 gap-5">
                    <div className="lg:col-span-1">
                      <h3>Phone Number:</h3>
                    </div>
                    <div className="lg:col-span-4">
                      <h3 className="font-medium">{customerDetails?.phone}</h3>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-5 grid-cols-1 gap-5">
                    <div className="lg:col-span-1">
                      <h3>Remarks:</h3>
                    </div>
                    <div className="lg:col-span-4">
                      <h3 className="font-medium">
                        {customerDetails?.remarks || "No remarks"}
                      </h3>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-5 grid-cols-1 gap-5">
                    <div className="lg:col-span-1">
                      <h3>Option:</h3>
                    </div>
                    <div className="lg:col-span-4">
                      <h3 className="font-medium">
                        {deliveryOption === "delivery"
                          ? "External Delivery (Lalamove)"
                          : "Onsite Installation"}
                      </h3>
                    </div>
                  </div>
                </div>
                <p className="text-destructive font-medium text-sm mt-2">
                  Note: This order is subject to Tyre2Go confirmation. Please
                  wait for the confirmation, <strong>via email address</strong>.
                </p>

                {/* Navigation Buttons */}
                <div className="mt-5 flex items-center w-full gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      router.back();
                    }}
					disabled={isSubmitting}
                    className="flex-1 border-primary text-primary hover:bg-transparent hover:text-primary/80"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    variant="default"
                    className="flex-1"
					disabled={isSubmitting}
                  >
                    <ArrowRight className="size-4" />
                    Place my order
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2 h-full flex flex-col">
            <div className="border shadow flex-1 flex flex-col">
              <div className="p-4 bg-gray-200 text-black font-semibold text-lg">
                Order Summary
              </div>
              <div className="px-4 py-3 space-y-5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border-b px-3 py-2 flex items-center gap-10"
                  >
                    <div className="relative size-30">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="size-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-primary font-medium">{item.brand}</h3>
                      <p className="text-primary font-bold text-lg">
                        {item.tireSize}
                      </p>
                      <p className="text-primary font-bold text-lg">
                        {item.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pb-5 px-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-base">SRP</h3>
                  <h3 className="font-medium text-base">
                    ₱{formatCurrency(srpPrice)}
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-base">Tire Discount</h3>
                  <h3 className="font-medium text-base text-primary">
                    (₱{formatCurrency(discountAmount)})
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-base">Discounted Price</h3>
                  <h3 className="font-medium text-base">
                    ₱{formatCurrency(discountedTotal)}
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-base">Quantity</h3>
                  <h3 className="font-medium text-base">{item.quantity}</h3>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Total</h3>
                  <h3 className="font-medium text-primary text-lg">
                    ₱{formatCurrency(discountedTotal)}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  * You’ll only be charged once your order is confirmed
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
