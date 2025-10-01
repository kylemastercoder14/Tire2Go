"use client";

import { Promotions } from "@prisma/client";
import Image from 'next/image';
import Link from 'next/link';
import React from "react";
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

const Client = ({ data }: { data: Promotions[] }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No promotions or discounts available.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {data.map((promo) => (
        <div
          key={promo.id}
          className="flex flex-col md:flex-row gap-5 border-b border-gray-200 pb-6"
        >
          {/* Left Thumbnail */}
          <div className="w-full md:w-1/3">
            <Image
              src={promo.thumbnail}
              alt={promo.name}
              width={400}
              height={250}
              className="rounded-md object-cover w-full h-[200px]"
            />
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Title */}
              <h2 className="text-lg font-bold">{promo.name}</h2>

              {/* Date */}
              <p className="text-sm text-muted-foreground mb-2">
                {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
              </p>

              {/* Description (truncate) */}
              <p className="text-sm text-gray-700 line-clamp-3">
                {promo.description}
              </p>
            </div>

            {/* Read More Button */}
            <div>
              <Link href={`/admin/promotions-and-discounts/${promo.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  READ MORE
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Client;
