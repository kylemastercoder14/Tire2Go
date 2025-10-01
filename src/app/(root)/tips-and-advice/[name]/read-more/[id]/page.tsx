import React from "react";
import db from "@/lib/db";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

const Page = async (props: {
  params: Promise<{
    name: string;
    id: string;
  }>;
}) => {
  const params = await props.params;
  const formattedName = decodeURIComponent(params.name);
  const data = await db.tipsGuides.findUnique({
    where: {
      id: params.id,
    },
  });
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div
        className="w-full pt-30 h-[20vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-white hover:text-white/90 font-bold"
                asChild
              >
                <Link href="/tips-and-advice">TIPS & ADVICE</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white" />
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-white hover:text-white/90 uppercase font-bold"
                asChild
              >
                <Link href={`/tips-and-advice/${formattedName}`}>
                  {formattedName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-bold uppercase">
                {data?.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <section className="pt-5 pb-10 max-w-7xl mx-auto">
        <div className="bg-white p-5">
          <h2 className="text-2xl text-center font-bold">{data?.title}</h2>
          <Separator className="my-3 bg-primary" />
          <div className="flex flex-col mt-4">
            <div className="relative w-[600px] h-80 mx-auto">
              <Image
                src={data?.thumbnail || ""}
                alt={data?.title || ""}
                fill
                className="object-cover size-full"
              />
            </div>
            <p className="mt-2 text-sm text-center font-medium text-muted-foreground">
              {data?.createdAt ? format(data.createdAt, "MMMM dd, yyyy") : ""}
            </p>
            <div
              className="prose prose-md max-w-none
           prose-headings:font-bold
           prose-headings:text-black
           prose-a:text-primary prose-a:underline
           prose-ul:list-disc prose-ol:list-decimal
           prose-li:marker:text-black mt-3 mb-3"
              dangerouslySetInnerHTML={{ __html: data?.content || "" }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
