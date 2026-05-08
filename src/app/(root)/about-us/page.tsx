/* eslint-disable @next/next/no-img-element */
import React from "react";
import {
  CORE_VALUES,
  HISTORY,
  MISSION,
  TEAM,
  VISION,
} from "@/constants";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { AnimatedTestimonials } from "@/components/globals/AnimatedTestimonials";
import { getTestimonials } from "@/actions";

const Page = async () => {
  // Fetch testimonials from database
  const testimonialsResult = await getTestimonials();
  const testimonials = testimonialsResult.data || [];
  return (
    <div className="min-h-screen">
      <div className="w-full h-[75vh] relative bg-gray-500">
        <Image
          src="/16.png"
          alt="About Us Banner"
          className="object-cover"
          fill
        />
      </div>
      <section className="mt-10 lg:pb-20 pb-10 grid lg:grid-cols-2 gap-10 grid-cols-1 lg:px-20 px-5">
        <div className="">
          <h3 className="text-primary text-4xl font-bold tracking-tight text-center">
            What is Tyre2Go?
          </h3>
          <p className="mt-5" dangerouslySetInnerHTML={{ __html: HISTORY }} />
          <div className="grid mt-10 lg:grid-cols-2 grid-cols-1 gap-20">
            <div>
              <h3 className="text-primary text-4xl font-bold tracking-tight text-center">
                Our Mission
              </h3>
              <p className="mt-5">{MISSION}</p>
            </div>
            <div>
              <h3 className="text-primary text-4xl font-bold tracking-tight text-center">
                Our Vision
              </h3>
              <p className="mt-5">{VISION}</p>
            </div>
          </div>
        </div>
        <div className="relative w-full h-[500px]">
          <Image
            src="/about.jpg"
            alt="Tyre2Go"
            fill
            className="object-cover"
          />
        </div>
      </section>
      <section>
        <h3 className="text-primary text-4xl font-bold tracking-tight text-center">
          Our Core Values
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 lg:pb-20 pb-10 gap-6 lg:px-20 px-5 mt-10">
          {CORE_VALUES.map((value, index) => (
            <Card
              key={index}
              className="flex flex-col items-center justify-center p-6 shadow-md rounded-2xl hover:shadow-lg transition"
            >
              <value.icon className="w-12 h-12 text-primary mb-4" />
              <CardContent className="text-center p-0">
                <h4 className="text-lg font-semibold mb-2">{value.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="my-10 max-w-7xl mx-auto">
        <h3 className="text-primary text-4xl font-bold tracking-tight text-center">
          What our customers say about us
        </h3>
        {testimonials.length > 0 ? (
          <AnimatedTestimonials testimonials={testimonials} />
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No testimonials available yet. Be the first to share your feedback!
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Page;
