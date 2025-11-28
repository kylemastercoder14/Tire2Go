"use client";

import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StarRating = ({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating ?? rating;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= displayRating;
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={cn(
              "transition-colors duration-150",
              !readonly && "cursor-pointer hover:scale-110",
              readonly && "cursor-default"
            )}
            aria-label={`Rate ${value} out of 5 stars`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-300 text-gray-300",
                !readonly && "hover:fill-yellow-300 hover:text-yellow-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

