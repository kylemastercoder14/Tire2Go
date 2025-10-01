"use client";

import { useRouter } from "next/navigation";
import React from "react";
import useCart from "@/hooks/use-cart";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { DatePicker } from "@/components/globals/DatePicker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const Page = () => {
  const router = useRouter();

  const { items, setPreferredSchedule, preferredSchedule, setCustomerDetails } =
    useCart();

  const [details, setDetails] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    remarks: "",
    acceptedTerms: false,
  });

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
    if (!details.acceptedTerms) {
      toast.error(
        "You must accept the terms and conditions before continuing."
      );
      return;
    }

    // (you could also check other required fields here if needed)
    if (
      !details.firstName ||
      !details.lastName ||
      !details.email ||
      !details.phone
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setCustomerDetails(details); // save to store
    router.push("/checkout-review");
  };

  const item = items[0]; // since you allow only one product
  const srpPrice = item.unitPrice;
  const srpTotal = item.unitPrice * item.quantity;
  const discountedTotal =
    (item.discountedPrice ?? item.unitPrice) * item.quantity;
  const discountAmount = srpTotal - discountedTotal;

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
            2
          </div>
          <h3 className="text-primary font-semibold text-center">
            ORDER DETAILS
          </h3>
        </div>
        <ChevronRight className="size-4 text-white mx-5" />
        <div className="flex items-center gap-2">
          <div className="bg-white size-5 rounded-full flex items-center justify-center text-primary text-xs font-medium">
            3
          </div>
          <h3 className="text-white font-semibold text-center">REVIEW</h3>
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
                Your Order Details
              </div>
              <div className="p-5 space-y-6">
                {/* Preferred Schedule */}
                <div className="space-y-2">
                  <h3 className="text-primary font-medium">
                    Preferred schedule details
                  </h3>
                  <DatePicker
                    value={preferredSchedule ?? undefined}
                    onChange={(date?: Date) =>
                      setPreferredSchedule(date ?? null)
                    }
                    descriptionText={
                      preferredSchedule
                        ? `Your tires are scheduled for delivery/installation on ${formatDate(
                            preferredSchedule
                          )}.`
                        : "Select your preferred date for tire delivery or installation."
                    }
                  />
                </div>

                <Separator />

                {/* Customer Details */}
                <div className="space-y-4">
                  <h3 className="text-primary font-medium">Customer Details</h3>

                  <div className="grid lg:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label>
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={details.firstName}
                        onChange={(e) =>
                          setDetails({ ...details, firstName: e.target.value })
                        }
                        required
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={details.lastName}
                        onChange={(e) =>
                          setDetails({ ...details, lastName: e.target.value })
                        }
                        required
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label>
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={details.email}
                        onChange={(e) =>
                          setDetails({ ...details, email: e.target.value })
                        }
                        type="email"
                        required
                        placeholder="Enter your email address"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>
                        Phone <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={details.phone}
                        onChange={(e) =>
                          setDetails({ ...details, phone: e.target.value })
                        }
                        required
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Remarks (optional)</Label>
                    <Textarea
                      value={details.remarks}
                      onChange={(e) =>
                        setDetails({ ...details, remarks: e.target.value })
                      }
                      placeholder="Any additional information or requests"
                    />
                  </div>

                  <div className="flex items-start mt-3 gap-3">
                    <Checkbox
                      checked={details.acceptedTerms}
                      onCheckedChange={(checked) =>
                        setDetails({ ...details, acceptedTerms: !!checked })
                      }
                    />
                    <div className="grid gap-2">
                      <Label>Accept terms and conditions</Label>
                      <p className="text-muted-foreground text-sm">
                        By checking this box, you agree to the{" "}
                        <Link className="underline text-primary" href="#">
                          terms
                        </Link>{" "}
                        and{" "}
                        <Link className="underline text-primary" href="#">
                          privacy policy
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="mt-5 flex items-center w-full gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
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
