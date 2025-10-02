import React from "react";
import {
  CORE_VALUES,
  HISTORY,
  MISSION,
  TEAM,
  TESTIMONIALS,
  VISION,
} from "@/constants";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { AnimatedTestimonials } from "@/components/globals/AnimatedTestimonials";

const Page = () => {
  return (
    <div className="min-h-screen">
      <div className="w-full h-[75vh] relative bg-gray-500">
        <Image src="/16.png" alt="About Us Banner" className='object-cover' fill />
      </div>
      <section className="mt-10 pb-20 grid lg:grid-cols-2 gap-10 grid-cols-1 px-20">
        <div className="">
          <h3 className="text-primary text-4xl font-bold tracking-tight text-center">
            What is Tire2Go?
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
        <div className="bg-primary h-[500px]"></div>
      </section>
      <section>
        <h3 className="text-primary text-4xl font-bold tracking-tight text-center">
          Our Core Values
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 pb-20 gap-6 px-20 mt-10">
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
      <section className="pb-10">
        <h3 className="text-primary text-4xl font-bold tracking-tight text-center">
          Our Team
        </h3>
        <div className="grid max-w-2xl mx-auto lg:grid-cols-5 gap-3 grid-cols-1 mt-5">
          {TEAM.map((member) => {
            return (
              <div className="relative w-full h-30" key={member.id}>
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="size-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </section>
      <section className="my-10 max-w-7xl mx-auto">
        <h3 className="text-primary text-4xl font-bold tracking-tight text-center">
          What our customers say about us
        </h3>
        <AnimatedTestimonials testimonials={TESTIMONIALS} />
      </section>
    </div>
  );
};

export default Page;
