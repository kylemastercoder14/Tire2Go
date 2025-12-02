import React from "react";
import { getUserOrders } from "@/actions";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import OrderHistoryClient from "./_components/order-history-client";

const Page = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const result = await getUserOrders();

  if (result.error) {
    // Handle error - could show error page or empty state
    return (
      <div className="min-h-screen bg-[#f5f5f5] pt-36 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Order History</h1>
            <p className="text-muted-foreground">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const orders = result.data || [];

  return <OrderHistoryClient orders={orders} />;
};

export default Page;
