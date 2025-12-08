"use client";

import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
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
            ✓
          </div>
          <h3 className="text-primary lg:block hidden font-semibold text-center">CART</h3>
        </div>
        <ChevronRight className="size-4 text-white mx-5" />
        <div className="flex items-center gap-2">
          <div className="bg-primary size-5 rounded-full flex items-center justify-center text-white text-xs font-medium">
            ✓
          </div>
          <h3 className="text-primary lg:block hidden font-semibold text-center">
            ORDER DETAILS
          </h3>
        </div>
        <ChevronRight className="size-4 text-white mx-5" />
        <div className="flex items-center gap-2">
          <div className="bg-primary size-5 rounded-full flex items-center justify-center text-white text-xs font-medium">
            ✓
          </div>
          <h3 className="text-primary lg:block hidden font-semibold text-center">REVIEW</h3>
        </div>
        <ChevronRight className="size-4 text-white mx-5" />
        <div className="flex items-center gap-2">
          <div className="bg-primary size-5 rounded-full flex items-center justify-center text-white text-xs font-medium">
            4
          </div>
          <h3 className="text-primary lg:block hidden font-semibold text-center">COMPLETED</h3>
        </div>
      </div>

      {/* Main Section */}
      <section className="pt-5 lg:px-34 px-5 pb-10">
        <div className="flex flex-col items-center justify-center">
          <Image src="/complete.svg" alt="Completed" width={300} height={300} />
          <h3 className="font-semibold text-lg mt-5">
            Thank you for your order! A confirmation email has been sent to you.
          </h3>
          <p className="text-muted-foreground text-sm mt-3">
            If you want to place a new order, click the button below.
          </p>
          <Button
            onClick={() => router.push("/clearance-sale")}
            className="mt-5"
          >
            Continue Shopping <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Page;
