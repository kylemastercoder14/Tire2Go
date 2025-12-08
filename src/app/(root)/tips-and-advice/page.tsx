import React from "react";
import { TIPS_CATEGORY } from "@/constants";
import Image from "next/image";
import Link from "next/link";

const Page = () => {
  return (
    <div className="min-h-screen">
      <div className="w-full pt-24 sm:pt-30 h-[15vh] sm:h-[20vh] flex items-center justify-center bg-cover bg-center px-4"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}>
        <h3 className="text-white font-bold text-center text-lg sm:text-xl lg:text-2xl">TIPS & ADVICE</h3>
      </div>
      <section className="pt-4 sm:pt-5 pb-8 sm:pb-10 px-4 sm:px-5 lg:px-10 max-w-7xl mx-auto">
        <p className="text-center text-sm sm:text-base">
          We provide you with a compilation of information that will help you
          make better decisions whether you plan to buy new tires or just
          interested to learn more about general maintenance.
        </p>
        <div className="grid mt-4 sm:mt-5 sm:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-4 sm:gap-5">
          {TIPS_CATEGORY.map((item) => (
            <Link
              href={`/tips-and-advice/${item.label}`}
              key={item.slug}
              className="border w-full h-64 sm:h-72 lg:h-80 relative rounded-md overflow-hidden"
            >
              <Image
                src={item.image}
                alt={item.label}
                fill
                className="object-cover size-full"
              />
              {/* bg-overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/30" />
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                <h4 className="text-white font-bold text-base sm:text-lg lg:text-xl">{item.label}</h4>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Page;
