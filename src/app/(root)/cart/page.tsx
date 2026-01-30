"use client";

import { useRouter } from "next/navigation";
import React from "react";
import useCart from "@/hooks/use-cart";
import { ArrowLeft, ArrowRight, ChevronRight, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const Page = () => {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    removeAll,
    setDeliveryOption,
    deliveryOption,
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

  const handleContinue = () => {
    if (!deliveryOption) {
      toast.error("Please select an option");
      return;
    }
    router.push("/checkout-order-details");
  };

  // Calculate totals for all items
  const calculateTotals = () => {
    let totalSrp = 0;
    let totalDiscounted = 0;

    items.forEach((item) => {
      const srp = item.unitPrice * item.quantity;
      const effectivePrice = (item.discountedPrice && item.discountedPrice > 0)
        ? item.discountedPrice
        : item.unitPrice;
      const discounted = effectivePrice * item.quantity;

      totalSrp += srp;
      totalDiscounted += discounted;
    });

    return {
      totalSrp,
      totalDiscounted,
      totalDiscount: totalSrp - totalDiscounted,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div
        className="w-full pt-30 lg:h-[20vh] h-[23vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}
      >
        {/* Steps */}
        <div className="flex items-center gap-2">
          <div className="bg-primary size-5 rounded-full flex items-center justify-center text-white text-xs font-medium">
            1
          </div>
          <h3 className="text-primary font-semibold lg:block hidden lg:text-base text-sm text-center">CART</h3>
        </div>
        <ChevronRight className="size-4 text-white mx-5" />
        <div className="flex items-center gap-2">
          <div className="bg-white size-5 rounded-full flex items-center justify-center text-primary text-xs font-medium">
            2
          </div>
          <h3 className="text-white lg:block hidden lg:text-base text-sm font-semibold text-center">
            ORDER DETAILS
          </h3>
        </div>
        <ChevronRight className="size-4 text-white mx-5" />
        <div className="flex items-center gap-2">
          <div className="bg-white size-5 rounded-full flex items-center justify-center text-primary text-xs font-medium">
            3
          </div>
          <h3 className="text-white lg:block hidden lg:text-base text-sm font-semibold text-center">REVIEW</h3>
        </div>
        <ChevronRight className="size-4 text-white mx-5" />
        <div className="flex items-center gap-2">
          <div className="bg-white size-5 rounded-full flex items-center justify-center text-primary text-xs font-medium">
            4
          </div>
          <h3 className="text-white lg:block hidden lg:text-base text-sm font-semibold text-center">COMPLETED</h3>
        </div>
      </div>

      {/* Main Section */}
      <section className="pt-5 lg:px-34 px-5 pb-10">
        <div className="grid items-stretch lg:grid-cols-5 grid-cols-1">
          {/* Cart */}
          <div className="lg:col-span-3 h-full flex flex-col">
            <div className="border shadow flex-1 flex flex-col">
              <div className="p-4 bg-primary text-white font-semibold text-lg">
                Your Cart
              </div>
              <div className="p-5 space-y-6">
                {/* Cart Items List */}
                <div className="space-y-4">
                  <h3 className="text-primary font-medium">
                    Cart Items ({items.length} {items.length === 1 ? 'item' : 'items'})
                  </h3>
                  <div className="space-y-4">
                    {items.map((item) => {
                      const effectivePrice = (item.discountedPrice && item.discountedPrice > 0)
                        ? item.discountedPrice
                        : item.unitPrice;
                      const itemTotal = effectivePrice * item.quantity;

                      return (
                        <div
                          key={item.id}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start gap-4">
                            <div className="relative size-20 flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-contain rounded"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg text-primary">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">{item.brand}</p>
                              <p className="text-sm text-muted-foreground">{item.tireSize}</p>
                              <div className="mt-2">
                                <p className="font-semibold text-primary">
                                  ₱ {formatCurrency(effectivePrice)} per tire
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-3">
                              <Button
                                size="icon"
                                variant="secondary"
                                className="rounded-full size-7 !bg-gray-500 !text-white"
                                onClick={() =>
                                  updateQuantity(item.id, Math.max(1, item.quantity - 1))
                                }
                              >
                                <Minus className="size-4" />
                              </Button>
                              <h3 className="text-lg font-bold text-black w-8 text-center">
                                {item.quantity}
                              </h3>
                              <Button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                size="icon"
                                className="rounded-full size-7"
                              >
                                <Plus className="size-4" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-primary">
                                ₱ {formatCurrency(itemTotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="space-y-4">
                  <h3 className="text-primary font-medium">
                    How do you want to receive your order?
                  </h3>

                  {/* External Delivery */}
                  <div
                    onClick={() => setDeliveryOption("delivery")}
                    className={`flex items-center p-4 rounded-sm gap-3 cursor-pointer transition ${
                      deliveryOption === "delivery"
                        ? "border-2 border-primary bg-white"
                        : "bg-accent"
                    }`}
                  >
                    <div
                      className={`relative size-20 lg:block hidden rounded-sm ${
                        deliveryOption === "delivery"
                          ? "bg-primary"
                          : "border border-gray-300"
                      }`}
                    >
                      <Image
                        src={
                          deliveryOption === "delivery"
                            ? "https://gogulong.ph/_nuxt/img/pickup-icon-white.8aaece5.png"
                            : "https://gogulong.ph/_nuxt/img/pickup-icon-gray.13ff536.png"
                        }
                        alt="Delivery Icon"
                        fill
                        className="size-full object-contain"
                      />
                    </div>
                    <div>
                      <h3
                        className={`font-bold ${
                          deliveryOption === "delivery"
                            ? "text-primary"
                            : "text-black"
                        }`}
                      >
                        External Delivery (e.g. Lalamove)
                      </h3>
                      <p className="text-xs text-gray-500">
                        * Delivery fee will be charged directly by the customer,
                        not covered by our system.
                      </p>
                    </div>
                  </div>

                  {/* Install in shop */}
                  <div
                    onClick={() => setDeliveryOption("installation")}
                    className={`flex items-center p-4 rounded-sm gap-3 cursor-pointer transition ${
                      deliveryOption === "installation"
                        ? "border-2 border-primary bg-white"
                        : "bg-accent"
                    }`}
                  >
                    <div
                      className={`relative size-20 lg:block hidden rounded-sm ${
                        deliveryOption === "installation"
                          ? "bg-primary"
                          : "border border-gray-300"
                      }`}
                    >
                      <Image
                        src={
                          deliveryOption === "installation"
                            ? "https://gogulong.ph/_nuxt/img/installation-icon-white.99f55d6.png"
                            : "https://gogulong.ph/_nuxt/img/installation-icon-gray.f318805.png"
                        }
                        alt="Installation Icon"
                        fill
                        className="size-full object-contain"
                      />
                    </div>
                    <div>
                      <h3
                        className={`font-bold ${
                          deliveryOption === "installation"
                            ? "text-primary"
                            : "text-black"
                        }`}
                      >
                        Free Installation Onsite (Our Shop)
                      </h3>
                      <p className="text-xs text-gray-500">
                        * Get your tires installed for free at our shop
                        location.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="mt-5 flex items-center w-full gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      removeAll();
                      router.back();
                    }}
                    className="flex-1 border-primary text-primary hover:bg-transparent hover:text-primary/80"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleContinue}
                    variant="default"
                    className="flex-1"
                  >
                    <ArrowRight className="size-4" />
                    Continue
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
                  <h3 className="font-medium text-base">Subtotal</h3>
                  <h3 className="font-medium text-base text-right">
                    ₱ {formatCurrency(totals.totalSrp)}
                  </h3>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-base">Gross Discount</h3>
                    <h3 className="font-medium text-base text-primary text-right">
                      -₱ {formatCurrency(totals.totalDiscount)}
                    </h3>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-base">Total Quantity</h3>
                  <h3 className="font-medium text-base">{totals.totalQuantity} {totals.totalQuantity === 1 ? 'tire' : 'tires'}</h3>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Total</h3>
                  <h3 className="font-medium text-primary text-lg text-right">
                    ₱ {formatCurrency(totals.totalDiscounted)}
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
