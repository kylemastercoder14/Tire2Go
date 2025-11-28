"use client";

import { useRouter } from "next/navigation";
import React from "react";
import useCart from "@/hooks/use-cart";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DatePicker } from "@/components/globals/DatePicker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { PolicyModal } from "@/components/globals/PolicyModal";

const Page = () => {
  const router = useRouter();

  const { items, setPreferredSchedule, preferredSchedule, setCustomerDetails } =
    useCart();

  // Set minimum date to the later of: January 1, 2025 or today's date
  // This ensures we don't allow dates before 2025, but also disable past dates
  const minDate = React.useMemo(() => {
    const january2025 = new Date(2025, 0, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Return the later date (so we never allow dates before 2025, and also never allow past dates)
    return today > january2025 ? today : january2025;
  }, []);

  // Validate and clear date if it's before the minimum date
  React.useEffect(() => {
    if (preferredSchedule && preferredSchedule < minDate) {
      setPreferredSchedule(null);
      toast.error("Pickup date must be today or later (2025 and onwards). Please select a new date.");
    }
  }, [preferredSchedule, minDate, setPreferredSchedule]);

  const [details, setDetails] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    remarks: "",
    acceptedTerms: false,
  });

  // Handle phone number input - only numbers, max 10 digits
  const handlePhoneChange = (value: string) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, "");

    // Limit to 10 digits
    const limitedValue = numericValue.slice(0, 10);

    setDetails({ ...details, phone: limitedValue });
  };

  // Format phone number for display: (+63) XXXXXXXXXX
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    return `(+63) ${phone}`;
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Email validation state
  const [emailError, setEmailError] = React.useState<string>("");

  // Policy modal states
  const [isTermsOpen, setIsTermsOpen] = React.useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);

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

    // Validate email format
    if (!isValidEmail(details.email)) {
      setEmailError("Please enter a valid email address (e.g., johndoe@gmail.com)");
      toast.error("Please enter a valid email address.");
      return;
    }
    setEmailError(""); // Clear error if valid

    // Validate phone number length
    if (details.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    // Save phone number with +63 prefix
    const customerDetailsWithPhone = {
      ...details,
      phone: `+63${details.phone}`, // Add +63 prefix when saving
    };

    setCustomerDetails(customerDetailsWithPhone); // save to store
    router.push("/checkout-review");
  };

  const item = items[0]; // since you allow only one product
  const srpPrice = item.unitPrice;
  const srpTotal = item.unitPrice * item.quantity;
  // Use discountedPrice if it exists and is greater than 0, otherwise use unitPrice
  const effectivePrice = (item.discountedPrice && item.discountedPrice > 0)
    ? item.discountedPrice
    : item.unitPrice;
  const discountedTotal = effectivePrice * item.quantity;
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
                    fromDate={minDate}
                    descriptionText={
                      preferredSchedule
                        ? `Your tires are scheduled for delivery/installation on ${formatDate(
                            preferredSchedule
                          )}.`
                        : "Select your preferred date for tire delivery or installation (today or later, 2025 and onwards)."
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
                        onChange={(e) => {
                          const emailValue = e.target.value;
                          setDetails({ ...details, email: emailValue });
                          // Clear error on input if email becomes valid
                          if (emailError && isValidEmail(emailValue)) {
                            setEmailError("");
                          }
                        }}
                        onBlur={() => {
                          // Validate on blur if email is filled
                          if (details.email && !isValidEmail(details.email)) {
                            setEmailError("Please enter a valid email address (e.g., johndoe@gmail.com)");
                          } else {
                            setEmailError("");
                          }
                        }}
                        type="email"
                        required
                        placeholder="johndoe@gmail.com"
                        className={emailError ? "border-destructive" : ""}
                      />
                      {emailError && (
                        <p className="text-sm text-destructive">{emailError}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>
                        Phone <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                          (+63)
                        </div>
                        <Input
                          value={details.phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          required
                          placeholder="9123456789"
                          className="pl-16"
                          type="tel"
                          maxLength={10}
                          inputMode="numeric"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {details.phone ? formatPhoneNumber(details.phone) : "(+63) 9XXXXXXXXX"}
                        {details.phone && ` (${details.phone.length}/10 digits)`}
                      </p>
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
                        <button
                          type="button"
                          onClick={() => setIsTermsOpen(true)}
                          className="underline text-primary hover:text-primary/80"
                        >
                          terms
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          onClick={() => setIsPrivacyOpen(true)}
                          className="underline text-primary hover:text-primary/80"
                        >
                          privacy policy
                        </button>
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

      {/* Policy Modals */}
      <PolicyModal
        type="Terms and Conditions"
        open={isTermsOpen}
        onOpenChange={setIsTermsOpen}
      />
      <PolicyModal
        type="Privacy Policy"
        open={isPrivacyOpen}
        onOpenChange={setIsPrivacyOpen}
      />
    </div>
  );
};

export default Page;
