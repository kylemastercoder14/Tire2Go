import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import Client from "./_components/client";

const Page = async () => {
  const data = await db.promotions.findMany({
    orderBy: {
      startDate: "desc",
    },
  });
  return (
    <div>
      <div className="flex items-center flex-wrap gap-3 justify-between">
        <Heading
          title="Promotions & Discounts"
          description="Browse and manage all promotions and discounts in your store."
        />

        <Button size="sm">
          <Link
            href="/admin/promotions-and-discounts/create"
            className="flex items-center gap-2"
          >
            <IconPlus className="size-4" />
            Create new promotion
          </Link>
        </Button>
      </div>
      <div className="mt-5">
        <Client data={data} />
      </div>
    </div>
  );
};

export default Page;
