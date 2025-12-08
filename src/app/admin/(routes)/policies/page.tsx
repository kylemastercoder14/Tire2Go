import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import PolicyCard from "./_components/policy-card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";

const Page = async () => {
  const data = await db.policies.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div>
      <div className="flex items-center flex-wrap gap-3 justify-between">
        <Heading
          title="Policies"
          description="Manage your store's policies and regulations."
        />
        {data.length > 0 && (
          <Button size="sm" className="mt-5">
            <Link
              href="/admin/policies/create"
              className="flex items-center gap-2"
            >
              <IconPlus className="size-4" />
              Create new policy
            </Link>
          </Button>
        )}
      </div>
      <div className="mt-5">
        {data.length > 0 ? (
          <div className="grid lg:grid-cols-4 grid-cols-1 gap-5">
            {data.map((policy) => (
              <PolicyCard data={policy} key={policy.id} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="relative w-full h-[200px]">
              <Image
                src="/empty.svg"
                alt="Empty"
                fill
                className="size-full object-contain"
              />
            </div>
            <h3 className="font-semibold mb-1 mt-3">No policies found.</h3>
            <p className="text-sm text-muted-foreground">
              Please add a new policy to get started.
            </p>
            <Button size="sm" className="mt-5">
              <Link
                href="/admin/policies/create"
                className="flex items-center gap-2"
              >
                <IconPlus className="size-4" />
                Create new policy
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
