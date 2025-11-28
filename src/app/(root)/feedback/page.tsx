"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { submitFeedback } from "@/actions";
import { FeedbackValidators } from "@/validators";
import { StarRating } from "@/components/ui/star-rating";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Heading from "@/components/globals/Heading";

const Page = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof FeedbackValidators>>({
    resolver: zodResolver(FeedbackValidators),
    mode: "onChange",
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const rating = form.watch("rating");

  React.useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  async function onSubmit(values: z.infer<typeof FeedbackValidators>) {
    if (values.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitFeedback(values);

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success(response.success || "Feedback submitted successfully!");
      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20 pt-40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Heading
          title="Share Your Feedback"
          description="We value your opinion! Please take a moment to share your experience with us."
        />

        <div className="mt-8 bg-white border shadow rounded-lg p-6 sm:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Rating <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        <StarRating
                          rating={field.value || 0}
                          onRatingChange={(value) => {
                            field.onChange(value);
                          }}
                          size="lg"
                        />
                        {rating > 0 && (
                          <p className="text-sm text-muted-foreground">
                            You selected {rating} {rating === 1 ? "star" : "stars"}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Click on the stars to rate your experience (1 = Poor, 5 = Excellent)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Comments <span className="text-muted-foreground text-sm">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more about your experience. What did you like? What can we improve?"
                        className="min-h-[120px] resize-none"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Your feedback helps us improve our service and products
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                  }}
                  disabled={isSubmitting}
                >
                  Clear
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="mt-8 bg-white border shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Why Your Feedback Matters</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Helps us improve our products and services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Enables us to better serve you and other customers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Your voice shapes our future improvements</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Page;
