import React from "react";
import { getUserOrders } from "@/actions";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import OrderDetailsUser from "./_components/order-details-user";
import { OrderWithOrderItem } from "@/types";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get all user orders
  const result = await getUserOrders();

  if (result.error || !result.data) {
    redirect("/order-history");
  }

  // Find the specific order
  const order = result.data.find((o) => o.id === params.id);

  if (!order) {
    redirect("/order-history");
  }

  // Filter to only include order items (already included in the data)
  const orderWithItems: OrderWithOrderItem = {
    ...order,
    orderItem: order.orderItem.map((item) => ({
      ...item,
      product: {
        ...item.product,
        brand: item.product.brand,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-36 pb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <OrderDetailsUser initialData={orderWithItems} />
      </div>
    </div>
  );
};

export default Page;
