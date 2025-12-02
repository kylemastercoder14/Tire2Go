import React from "react";
import { Separator } from "@/components/ui/separator";
import db from "@/lib/db";
import { format } from "date-fns";

const Page = async () => {
  const items = await db.policies.findFirst({
    where: {
      type: "Terms & Conditions",
    },
  });

  const date = items?.createdAt || items?.updatedAt;
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="pt-36 px-24">
        <h3 className="text-black text-4xl font-bold tracking-tight text-center">
          Terms & Conditions
        </h3>
        <Separator className="mt-5 mb-10 bg-primary rouned-lg !h-[5px]" />
        <h3 className="font-semibold">
          Last Updated Date:{" "}
          {date ? format(items.updatedAt, "MMMM dd, yyyy") : "N/A"}
        </h3>
        <div
          className="prose prose-md mt-10 max-w-none
           prose-headings:font-bold
           prose-headings:text-black
           prose-a:text-primary prose-a:underline
           prose-ul:list-disc prose-ol:list-decimal
           prose-li:marker:text-black prose-img:w-[400px] prose-img:h-[200px] prose-img:object-contain"
          dangerouslySetInnerHTML={{ __html: items?.content || "" }}
        />
      </div>
    </div>
  );
};

export default Page;
