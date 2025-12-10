"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { submitReview, getProductReviews, canUserReviewProduct } from "@/actions";
import { ReviewValidators } from "@/validators";
import { StarRating } from "@/components/ui/star-rating";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [averageRating, setAverageRating] = React.useState(0);
  const [totalReviews, setTotalReviews] = React.useState(0);
  const [ratingCounts, setRatingCounts] = React.useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [canReview, setCanReview] = React.useState(false);
  const [checkingEligibility, setCheckingEligibility] = React.useState(true);

  const form = useForm<z.infer<typeof ReviewValidators>>({
    resolver: zodResolver(ReviewValidators),
    mode: "onChange",
    defaultValues: {
      productId,
      rating: 0,
      comment: "",
    },
  });

  const rating = form.watch("rating");

  // Check review eligibility and fetch reviews on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setCheckingEligibility(true);

        // Check if user can review
        if (user && isLoaded) {
          const eligibility = await canUserReviewProduct(productId);
          setCanReview(eligibility.canReview || false);
        }

        // Fetch reviews
        const result = await getProductReviews(productId);
        if (result.error) {
          toast.error(result.error);
        } else if (result.reviews) {
          setReviews(result.reviews);
          setAverageRating(result.averageRating || 0);
          setTotalReviews(result.totalReviews || 0);
          setRatingCounts(result.ratingCounts || ratingCounts);

        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
        setCheckingEligibility(false);
      }
    };
    fetchData();
  }, [productId, user, isLoaded]);

  async function onSubmit(values: z.infer<typeof ReviewValidators>) {
    if (values.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to submit a review");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitReview(values);

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success(response.success || "Review submitted successfully!");
      form.reset({
        productId,
        rating: 0,
        comment: "",
      });

      // Refresh reviews and check eligibility again
      const result = await getProductReviews(productId);
      if (result.reviews) {
        setReviews(result.reviews);
        setAverageRating(result.averageRating || 0);
        setTotalReviews(result.totalReviews || 0);
        setRatingCounts(result.ratingCounts || ratingCounts);
      }

      // User has now reviewed, so they can't review again
      setCanReview(false);

      router.refresh();
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle restricted input for comment
  const handleRestrictedInputChange = (value: string) => {
    const allowedPattern = /^[a-zA-Z0-9\s.,!?()]*$/;
    if (allowedPattern.test(value)) {
      form.setValue("comment", value);
    }
  };

  if (loading) {
    return (
      <div className="py-2 px-3">
        <p className="text-sm text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="py-2 px-3">
      {/* Reviews Summary */}
      <div className="mb-6 pb-4 border-b">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} readonly size="lg" />
            <p className="text-sm text-muted-foreground mt-1">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star as keyof typeof ratingCounts];
              const percentage =
                totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-sm w-8">{star} star</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {user && isLoaded ? (
        <div className="mb-6 pb-4 border-b">
          <h4 className="font-semibold mb-3">Write a Review</h4>
          {checkingEligibility ? (
            <p className="text-sm text-muted-foreground">Checking eligibility...</p>
          ) : canReview ? (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating *</FormLabel>
                    <FormControl>
                      <StarRating
                        rating={field.value || 0}
                        onRatingChange={(value) => {
                          field.onChange(value);
                        }}
                        size="lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Comment <span className="text-muted-foreground text-sm">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience with this product..."
                        className="min-h-[100px] resize-none"
                        value={field.value || ""}
                        onChange={(e) => handleRestrictedInputChange(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Only letters, numbers, spaces, and these characters are allowed: . , ! ? ( )
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </Form>
          ) : (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                You can only review products from orders that are{" "}
                <span className="font-semibold">completed</span> and{" "}
                <span className="font-semibold">paid</span>.
                {reviews.length > 0 && reviews.some((r: any) => r.userId === user.id) && " You have already reviewed this product."}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 pb-4 border-b">
          <p className="text-sm text-muted-foreground">
            Please{" "}
            <a href="/sign-in" className="text-primary underline">
              sign in
            </a>{" "}
            to write a review.
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="pb-4 border-b last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">
                    {review.user.firstName} {review.user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(review.createdAt), "MMMM dd, yyyy")}
                  </p>
                </div>
                <StarRating rating={review.rating} readonly size="sm" />
              </div>
              {review.comment && (
                <p className="text-sm mt-2 whitespace-pre-wrap">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;

