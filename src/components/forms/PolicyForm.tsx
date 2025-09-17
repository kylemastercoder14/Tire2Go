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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PolicyValidators } from "@/validators";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPolicy, updatePolicy } from "@/actions";
import { Policies } from "@prisma/client";
import { RichTextEditor } from '@/components/globals/RichTextEditor';

const PolicyForm = ({ initialData }: { initialData: Policies | null }) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof PolicyValidators>>({
    resolver: zodResolver(PolicyValidators),
    mode: "onChange",
    defaultValues: {
      type: initialData?.type || "",
      content: initialData?.content || "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof PolicyValidators>) {
    try {
      let response;
      if (initialData?.id) {
        // If initialData.id exists, it's an update (PUT)
        response = await updatePolicy(initialData.id, values);
      } else {
        // Otherwise, it's a new creation (POST)
        response = await createPolicy(values);
      }

      if (response.error) {
        console.error("API Error:", response.error);
        toast.error(response.error || "An error occurred.");
        return;
      }

      toast.success(response.success || "Policy saved successfully!");
      router.push("/admin/policies");
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save policy. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Type <span className="text-red-600">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Privacy Policy">
                      Privacy Policy
                    </SelectItem>
                    <SelectItem value="Terms & Conditions">
                      Terms & Conditions
                    </SelectItem>
                    <SelectItem value="Refund Policy">Refund Policy</SelectItem>
                    <SelectItem value="Intellectual Property">
                      Intellectual Property
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Content <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <RichTextEditor
                    onChangeAction={field.onChange}
                    disabled={isSubmitting}
                    value={field.value}
                    placeholder="Enter the content here..."
                  />
                </FormControl>
                <FormDescription>
                  Please provide detailed information about the policy.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="ghost"
              className="w-fit"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-fit" disabled={isSubmitting}>
              {initialData ? "Save Changes" : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default PolicyForm;
