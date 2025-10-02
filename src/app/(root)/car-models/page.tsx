import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div className="min-h-screen">
      <div
        className="w-full pt-30 h-[20vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}
      >
        <h3 className="text-white font-bold text-center">CAR MODELS</h3>
      </div>
      <section className="pt-5 max-w-7xl mx-auto px-8 pb-10">
        <h3 className="text-primary font-bold text-xl text-center">
          Featured Car Models
        </h3>
        <h3 className="text-primary font-bold text-3xl mt-2 text-center">
          Browse Popular Tires For Your Car
        </h3>
        <p className="mt-1 text-lg text-muted-foreground">
          At Tire2Go, we don’t just provide you tires by size; we also offer it
          based on car models. Here are some of our featured car models to find
          your tires:
        </p>

        <div className="grid lg:grid-cols-2 mt-5 grid-cols-1 gap-5">
          {/* Card */}
          <div className="relative w-full h-[300px] rounded-md overflow-hidden shadow border">
            {/* Background Image */}
            <Image
              src="/car-models/HYUNDAI ELANTRA.png"
              alt="HYUNDAI ELANTRA"
              fill
              className="object-cover"
            />

            {/* Gradient Overlay (white to transparent, from bottom to top) */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />

            {/* Text + Button at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Hyundai Elantra</h3>
              <Button>
                View Tires
              </Button>
            </div>
          </div>
		  {/* Card */}
          <div className="relative w-full h-[300px] rounded-md overflow-hidden shadow border">
            {/* Background Image */}
            <Image
              src="/car-models/TOYOTA AVANZA.png"
              alt="TOYOTA AVANZA"
              fill
              className="object-cover"
            />

            {/* Gradient Overlay (white to transparent, from bottom to top) */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />

            {/* Text + Button at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Toyota Avanza</h3>
              <Button>
                View Tires
              </Button>
            </div>
          </div>
		  {/* Card */}
          <div className="relative w-full h-[300px] rounded-md overflow-hidden shadow border">
            {/* Background Image */}
            <Image
              src="/car-models/MITSUBISHI XPANDER.png"
              alt="MITSUBISHI XPANDER"
              fill
              className="object-cover"
            />

            {/* Gradient Overlay (white to transparent, from bottom to top) */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />

            {/* Text + Button at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
              <h3 className="font-semibold capitalize text-gray-900">MITSUBISHI XPANDER</h3>
              <Button>
                View Tires
              </Button>
            </div>
          </div>
		  {/* Card */}
          <div className="relative w-full h-[300px] rounded-md overflow-hidden shadow border">
            {/* Background Image */}
            <Image
              src="/car-models/FORD RAPTOR.png"
              alt="FORD RAPTOR"
              fill
              className="object-cover"
            />

            {/* Gradient Overlay (white to transparent, from bottom to top) */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />

            {/* Text + Button at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
              <h3 className="font-semibold capitalize text-gray-900">FORD RAPTOR</h3>
              <Button>
                View Tires
              </Button>
            </div>
          </div>
		  {/* Card */}
          <div className="relative w-full h-[300px] rounded-md overflow-hidden shadow border">
            {/* Background Image */}
            <Image
              src="/car-models/NISSAN NAVARA.png"
              alt="NISSAN NAVARA"
              fill
              className="object-cover"
            />

            {/* Gradient Overlay (white to transparent, from bottom to top) */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />

            {/* Text + Button at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
              <h3 className="font-semibold capitalize text-gray-900">NISSAN NAVARA</h3>
              <Button>
                View Tires
              </Button>
            </div>
          </div>
		  {/* Card */}
          <div className="relative w-full h-[300px] rounded-md overflow-hidden shadow border">
            {/* Background Image */}
            <Image
              src="/car-models/HONDA CIVIC.png"
              alt="HONDA CIVIC"
              fill
              className="object-cover"
            />

            {/* Gradient Overlay (white to transparent, from bottom to top) */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />

            {/* Text + Button at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
              <h3 className="font-semibold capitalize text-gray-900">HONDA CIVIC</h3>
              <Button>
                View Tires
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
