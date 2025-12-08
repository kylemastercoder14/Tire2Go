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
        className="w-full pt-24 sm:pt-30 h-[15vh] sm:h-[20vh] flex items-center justify-center bg-cover bg-center px-4"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}
      >
        <Breadcrumb>
          <BreadcrumbList className="flex-wrap justify-center">
            <BreadcrumbItem className="hidden sm:block">
              <BreadcrumbLink
                className="text-white hover:text-white/90 font-bold text-sm sm:text-base"
                asChild
              >
                <Link href="/tips-and-advice">TIPS & ADVICE</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white hidden sm:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink
                className="text-white hover:text-white/90 uppercase font-bold text-sm sm:text-base"
                asChild
              >
                <Link href={`/tips-and-advice/${formattedName}`}>
                  {formattedName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-bold uppercase text-xs sm:text-sm md:text-base truncate max-w-[250px] sm:max-w-none">
                {data?.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <section className="pt-4 sm:pt-5 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white p-4 sm:p-5 lg:p-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl text-center font-bold">{data?.title}</h2>
          <Separator className="my-3 bg-primary" />
          <div className="flex flex-col mt-4">
            <div className="relative w-full max-w-[600px] h-48 sm:h-64 lg:h-80 mx-auto">
              <Image
                src={data?.thumbnail || ""}
                alt={data?.title || ""}
                fill
                className="object-cover size-full rounded-md"
              />
            </div>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-center font-medium text-muted-foreground">
              {data?.createdAt ? format(data.createdAt, "MMMM dd, yyyy") : ""}
            </p>
            <div
              className="prose prose-sm sm:prose-base lg:prose-md max-w-none
           prose-headings:font-bold
           prose-headings:text-black
           prose-headings:text-base sm:prose-headings:text-lg lg:prose-headings:text-xl
           prose-a:text-primary prose-a:underline
           prose-ul:list-disc prose-ol:list-decimal
           prose-li:marker:text-black
           prose-p:text-sm sm:prose-p:text-base
           prose-li:text-sm sm:prose-li:text-base
           prose-strong:text-sm sm:prose-strong:text-base
           mt-3 sm:mt-4 mb-3 sm:mb-4"
              dangerouslySetInnerHTML={{ __html: data?.content || "" }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
