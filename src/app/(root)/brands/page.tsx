import React from "react";
import db from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import TireSearch from "@/components/globals/TireSearch";
import { ArcTimeline, ArcTimelineItem } from "@/components/globals/ArcTimeline";
import {
  Calendar,
  Clock,
  FileSearch,
  LifeBuoy,
  MousePointerClick,
  SearchIcon,
  Wallet,
  Wrench,
} from "lucide-react";

const TIMELINE: ArcTimelineItem[] = [
  {
    time: "1",
    steps: [
      {
        icon: <SearchIcon width={20} height={20} />,
        content:
          "Search for tires based on car model by entering make, model, and year. Then choose from our recommended tire sizes.",
      },
    ],
  },
  {
    time: "2",
    steps: [
      {
        icon: <MousePointerClick width={20} height={20} />,
        content: "Choose any of the tires displayed on the results page.",
      },
    ],
  },
  {
    time: "3",
    steps: [
      {
        icon: <LifeBuoy width={20} height={20} />,
        content:
          "Browse through details of your selected tire then click on the Place Order button.",
      },
    ],
  },
  {
    time: "4",
    steps: [
      {
        icon: <Wrench width={20} height={20} />,
        content: "Choose the quantity and how you want to receive your tires.",
      },
    ],
  },
  {
    time: "5",
    steps: [
      {
        icon: <Calendar width={20} height={20} />,
        content:
          "Select your preferred schedule and enter your contact details. Agree to the Privacy Policy and Terms of Conditions, then click Continue.",
      },
    ],
  },
  {
    time: "6",
    steps: [
      {
        icon: <Wallet width={20} height={20} />,
        content:
          "Select your preferred payment option. You’ll only be charged once your order is confirmed. You can also enter your voucher discount here.",
      },
    ],
  },
  {
    time: "7",
    steps: [
      {
        icon: <FileSearch width={20} height={20} />,
        content:
          "Review your Order Summary and click on the Place My Order button.",
      },
    ],
  },
  {
    time: "8",
    steps: [
      {
        icon: <Clock width={20} height={20} />,
        content:
          "Wait for our agents to review and confirm your order. We will reach out to you via text, email, and Viber. A payment link shall also be sent once your order has been confirmed.",
      },
    ],
  },
];

const Page = async () => {
  const premiumBrands = await db.brands.findMany({
    where: {
      type: "Premium",
    },
    orderBy: {
      name: "asc",
    },
  });

  const midBrands = await db.brands.findMany({
    where: {
      type: "Mid-Range",
    },
    orderBy: {
      name: "asc",
    },
  });

  const budgetBrands = await db.brands.findMany({
    where: {
      type: "Budget",
    },
    orderBy: {
      name: "asc",
    },
  });
  return (
    <div className="min-h-screen">
      <div className="w-full pt-24 h-[20vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}>
        <h3 className="text-white font-bold text-center">BRANDS</h3>
      </div>
      <section className="py-10 max-w-7xl mx-auto">
        <h3 className="text-primary text-4xl font-bold tracking-tight text-center">
          Find The Best Tire Brands In The Philippines
        </h3>
        <p className="mt-5">
          Having the best tires on your car will help you go a long way. Aside
          from helping your car move, the right tires will allow you to save up
          on gas and repairs. And that&apos;s not even mentioning how it can
          keep you safe on the road. Now one of the things to consider when
          buying tires is the brand. And when it comes to the best tire brands
          in the Philippines, there&apos;s no better place to shop than Tire2Go.
        </p>
        <h3 className="text-2xl mt-10 font-bold tracking-tight text-center">
          Top Tire Brands Available at Tire2Go
        </h3>
        <p className="mt-5">
          From premium tires to budget tires, Tire2Go offers all kinds of
          high-quality tires for every car. To ensure our customers get the best
          tires for their cars, we&apos;ve partnered with many great tire brands
          in the Philippines. Tire2Go&apos;s list of tire brands in the
          Philippines include:
        </p>

        <h3 className="text-primary text-3xl mt-10 font-bold tracking-tight text-center">
          PREMIUM BRANDS
        </h3>
        <div className="grid mt-5 lg:grid-cols-4 grid-cols-1 gap-5">
          {premiumBrands.map((brand) => (
            <Link
              href={`/brands/${brand.id}`}
              key={brand.id}
              className="p-5 hover:shadow-2xl border rounded-lg flex flex-col bg-secondary items-center justify-center"
            >
              <div className="relative w-full h-20">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain size-full"
                />
              </div>
              <span className="uppercase mt-3 font-semibold">{brand.name}</span>
              <p className="mt-2 text-muted-foreground text-sm">
                {brand.description}
              </p>
            </Link>
          ))}
        </div>

        <h3 className="text-primary text-3xl mt-10 font-bold tracking-tight text-center">
          MID-RANGE BRANDS
        </h3>
        <div className="grid mt-5 lg:grid-cols-4 grid-cols-1 gap-5">
          {midBrands.map((brand) => (
            <Link
              href={`/brands/${brand.id}`}
              key={brand.id}
              className="p-5 border hover:shadow-2xl rounded-lg flex flex-col bg-secondary items-center justify-center"
            >
              <div className="relative w-full h-20">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain size-full"
                />
              </div>
              <span className="uppercase mt-3 font-semibold">{brand.name}</span>
              <p className="mt-2 text-muted-foreground text-sm">
                {brand.description}
              </p>
            </Link>
          ))}
        </div>

        <h3 className="text-primary text-3xl mt-10 font-bold tracking-tight text-center">
          ECONOMY/BUDGET BRANDS
        </h3>
        <div className="grid mt-5 lg:grid-cols-4 grid-cols-1 gap-5">
          {budgetBrands.map((brand) => (
            <Link
              href={`/brands/${brand.id}`}
              key={brand.id}
              className="p-5 border hover:shadow-2xl rounded-lg flex flex-col bg-secondary items-center justify-center"
            >
              <div className="relative w-full h-20">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain size-full"
                />
              </div>
              <span className="uppercase mt-3 font-semibold">{brand.name}</span>
              <p className="mt-2 text-muted-foreground text-sm">
                {brand.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-[#f5f5f5] py-10">
        <div className="px-60">
          <h3 className="text-primary text-4xl font-bold tracking-tight text-center">
            Enjoy the Best Tire Brands at Tire2Go
          </h3>
          <p className="text-center mt-3 mb-5">
            Aside from searching for tires by your preferred tire brand, you may
            also search tires by size or by car model here at Tire2Go:
          </p>
          <TireSearch isHomepage={false} />
        </div>
      </section>
      <section className="py-10 max-w-7xl mx-auto">
        <h3 className="text-primary text-4xl font-bold tracking-tight text-center">
          How Tire2Go Helps You Find High-Quality Tires
        </h3>
        <p className="text-center mt-3 mb-5">
          Tire2Go has a pretty simple and straightforward process. All you have
          to do is follow these steps:
        </p>
        <ArcTimeline
        //   className={cn(
        //     "[--step-line-active-color:#888888] dark:[--step-line-active-color:#9780ff]",
        //     "[--step-line-inactive-color:#b1b1b1] dark:[--step-line-inactive-color:#737373]",
        //     "[--placeholder-line-color:#a1a1a1] dark:[--placeholder-line-color:#737373]",
        //     "[--icon-active-color:#555555] dark:[--icon-active-color:#d4d4d4]",
        //     "[--icon-inactive-color:#a3a3a3] dark:[--icon-inactive-color:#a3a3a3]",
        //     "[--time-active-color:#555555] dark:[--time-active-color:#d4d4d4]",
        //     "[--time-inactive-color:#a3a3a3] dark:[--time-inactive-color:#a3a3a3]",
        //     "[--description-color:#555555] dark:[--description-color:#d4d4d4]"
        //   )}
          data={TIMELINE}
          defaultActiveStep={{ time: "1", stepIndex: 0 }}
          arcConfig={{
            circleWidth: 4500,
            angleBetweenMinorSteps: 0.4,
            lineCountFillBetweenSteps: 8,
            boundaryPlaceholderLinesCount: 50,
          }}
        />
      </section>
    </div>
  );
};

export default Page;
