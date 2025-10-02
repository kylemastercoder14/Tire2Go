import React from "react";
import db from "@/lib/db";
import OrderDetails from './order-details';

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const initialData = await db.order.findUnique({
    where: {
      id: params.id,
    },
    include: {
      orderItem: {
        include: {
          product: {
            include: {
              brand: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className='min-h-screen'>
      <OrderDetails initialData={initialData} />
    </div>
  );
};

export default Page;
