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

const Page = async (props: {
  params: Promise<{
	id: string;
  }>;
}) => {
  const params = await props.params;
  const data = await db.products.findUnique({
	where: {
	  id: params.id,
	},
	include: {
		brand: true
	}
  });

  return (
	<div className="min-h-screen bg-[#f5f5f5]">
	  <div
		className="w-full pt-24 h-[20vh] flex items-center justify-center bg-cover bg-center"
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
				<Link href="/clearance-sale">CLEARANCE SALE</Link>
			  </BreadcrumbLink>
			</BreadcrumbItem>
			<BreadcrumbSeparator className="text-white" />
			<BreadcrumbItem>
			  <BreadcrumbPage className="text-primary font-bold uppercase">
				Tire Details
			  </BreadcrumbPage>
			</BreadcrumbItem>
		  </BreadcrumbList>
		</Breadcrumb>
	  </div>
	  <section className="pt-5 pb-10 px-24">
		<h3>Wait</h3>
	  </section>
	</div>
  );
};

export default Page;
