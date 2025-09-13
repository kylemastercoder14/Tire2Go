import React from "react";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import db from "@/lib/db";

const Page = async () => {
  const items = await db.faqs.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="pt-30 px-24">
        <h3 className="text-black text-4xl font-bold tracking-tight text-center">
          Tire2Go Frequently Asked Questions
        </h3>
        <Separator className="mt-5 mb-10 bg-primary rouned-lg !h-[5px]" />
        <Accordion type="single" collapsible className="my-4 w-full space-y-2">
          {items.map((item) => (
            <AccordionItem
              key={item.id}
              value={`item-${item.id}`}
              className="border shadow rounded-md px-4 py-2 bg-white"
            >
              <AccordionTrigger className="text-lg hover:no-underline font-bold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose prose-md max-w-none
           prose-headings:font-bold
           prose-headings:text-muted-foreground
           prose-a:text-primary prose-a:underline
           prose-ul:list-disc prose-ol:list-decimal
           prose-li:marker:text-muted-foreground prose-img:w-[400px] prose-img:h-[200px] prose-img:object-contain text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Page;
