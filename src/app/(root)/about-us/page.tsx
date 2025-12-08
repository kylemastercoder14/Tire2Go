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
            src="/shop.jpg"
            alt="Tyre2Go"
            fill
            className="object-contain"
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
      <section className="pb-10 lg:px-20 px-5">
        <div className="text-center mb-12">
          <h3 className="text-5xl font-bold text-primary mb-3 tracking-tight">
            Our Team
          </h3>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Meet the talented individuals driving our success
          </p>
        </div>
        <div className="grid grid-cols-1 container mx-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {TEAM.map((member) => (
            <div
              key={member.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-red-100 to-purple-100">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-5 text-center">
                <h4 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {member.name}
                </h4>
                <p className="text-sm text-slate-600 font-medium">
                  {member.designation}
                </p>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <a
                  href={member.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 hover:scale-110 transition-all duration-300 group/icon"
                  aria-label={`Visit ${member.name}'s Facebook profile`}
                >
                  <svg
                    className="w-5 h-5 text-blue-600 group-hover/icon:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
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
