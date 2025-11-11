import React from "react";
import TireSearch from "@/components/globals/TireSearch";
import Image from "next/image";
import BrandsCollection from "@/components/globals/BrandsCollection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import HeroCarousel from '@/components/globals/HeroCarousel';
import { getTireSizesForSearch, getCarDataForSearch } from "@/actions";

const Page = async () => {
  // Fetch tire search data from database
  const [tireSizesResult, carDataResult] = await Promise.all([
    getTireSizesForSearch(),
    getCarDataForSearch(),
  ]);

  const searchBySize = tireSizesResult.data || {};
  const searchByCar = carDataResult.data || [];
  return (
    <div className="min-h-screen">
      <div className="bg-hero w-full flex flex-col items-start justify-end py-20 h-[80vh]">
        <div className="px-40 flex w-full items-center justify-between mb-10">
          <h3 className="text-white font-semibold text-5xl italic tracking-tight leading-relaxed">
            FIND THE INNOVATIVE TIRE <br />
            <span className="font-black">YOU NEED</span>
          </h3>
        </div>
        <div className="flex w-full px-40 items-start justify-between">
          <HeroCarousel />
          <TireSearch searchBySize={searchBySize} searchByCar={searchByCar} />
        </div>
      </div>
      <section className="pt-10 bg-[#f5f5f5] pb-10">
        <h3 className="text-primary text-center text-4xl font-bold tracking-tight">
          Top Tire Brands
        </h3>
        <p className="text-primary text-2xl mt-2 text-center">
          from our extensive collection
        </p>
        <BrandsCollection />
      </section>
      <section className="border-y shadow bg-white">
        <div className="flex flex-col items-center justify-center max-w-7xl mx-auto py-10">
          <h3 className="text-primary text-center text-4xl font-bold tracking-tight">
            Tires for your car
          </h3>
          <p className="text-primary text-2xl mt-2 text-center">
            browse popular tires for your car
          </p>
          <div className="relative w-full mt-5 h-[30vh]">
            <Image
              src="https://gogulong.ph/_nuxt/img/featured-car-models-desktop.570f354.webp"
              alt="Tire for your car"
              fill
              className="object-contain size-full"
            />
          </div>
          <Link href="/car-models">
            <Button size="lg" className="mx-auto mt-5 text-center">
              View Car Models
            </Button>
          </Link>
        </div>
      </section>
      <section className="pt-10 pb-10 flex flex-col items-center justify-center bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-5">
          <div className="relative w-52 h-32">
            <Image
              src="https://gogulong.ph/_nuxt/img/payment-channel-mastercard.d5375a5.png"
              alt="Mastercard"
              fill
              className="size-full object-contain"
            />
          </div>
          <div className="relative w-52 h-32">
            <Image
              src="https://gogulong.ph/_nuxt/img/payment-channel-visa.f4afbce.png"
              alt="Visa"
              fill
              className="size-full object-contain"
            />
          </div>
          <div className="relative w-52 h-32">
            <Image
              src="https://gogulong.ph/_nuxt/img/payment-channel-gcash.32ec8a6.png"
              alt="Gcash"
              fill
              className="size-full object-contain"
            />
          </div>
          <div className="relative w-52 h-32">
            <Image
              src="https://gogulong.ph/_nuxt/img/payment-channel-bpi.f323e87.png"
              alt="BPI"
              fill
              className="size-full object-contain"
            />
          </div>
          <div className="relative w-52 h-32">
            <Image
              src="https://gogulong.ph/_nuxt/img/payment-channel-chinabank.875cf1a.png"
              alt="China Bank"
              fill
              className="size-full object-contain"
            />
          </div>
          <div className="relative w-52 h-32">
            <Image
              src="https://gogulong.ph/_nuxt/img/payment-channel-union-bank.44fa4b0.png"
              alt="Union Bank"
              fill
              className="size-full object-contain"
            />
          </div>
          <div className="relative w-52 h-32">
            <Image
              src="https://gogulong.ph/_nuxt/img/payment-channel-metrobank.7f4e395.png"
              alt="Metrobank"
              fill
              className="size-full object-contain"
            />
          </div>
          <div className="relative w-52 h-32">
            <Image
              src="https://gogulong.ph/_nuxt/img/payment-channel-landbank.fdad9c1.png"
              alt="Landbank"
              fill
              className="size-full object-contain"
            />
          </div>
          <div className="relative w-52 h-32">
            <Image
              src="https://gogulong.ph/_nuxt/img/payment-channel-bayad-center.cc8fe22.png"
              alt="Bayad Center"
              fill
              className="size-full object-contain"
            />
          </div>
        </div>
      </section>
      <section className="pt-10 flex flex-col items-center justify-center bg-white">
        <h3 className="text-primary text-center text-4xl font-bold tracking-tight">
          Tire Installation Site
        </h3>
        <p className="text-primary text-2xl mt-2 text-center">
          locate a tire installation site near you
        </p>
        <iframe
          className="mt-5"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.86713495341!2d121.02337022578162!3d14.606643676927291!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7aa6dda4927%3A0x2d119ff5fd2d4d92!2s202%20Mags%20and%20Tires!5e0!3m2!1sen!2sph!4v1757572717505!5m2!1sen!2sph"
          width="100%"
          height="500"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
      <section className="border-y shadow bg-white">
        <div className="flex flex-col items-center justify-center max-w-7xl mx-auto py-10">
          <div className="relative w-full h-20">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain size-full"
            />
          </div>
          <h3 className="text-primary text-center text-4xl font-bold tracking-tight">
            ABOUT US
          </h3>
          <p className="mt-5">
            202 Mags and Tires was established three years ago with a simple
            vision of providing quality wheels and tires to car owners. What
            started as a small online post on the marketplace quickly gained the
            trust of customers. Through hard work, dedication, and passion for
            cars, the business grew steadily.
            <br /> <br />
            From selling online, we were able to open our very own physical
            store to serve more people. Our goal has always been to offer
            reliable products at affordable prices. We make sure every customer
            receives the best service and advice for their car needs. Today, 202
            Mags and Tires continues to grow as a trusted name in the community.
          </p>
          <Button size="lg" className="mx-auto mt-5 text-center">
            Learn more
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Page;
