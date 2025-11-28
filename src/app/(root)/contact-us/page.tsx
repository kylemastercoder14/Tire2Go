import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IconBrandFacebookFilled,
  IconBrandInstagramFilled,
  IconMailOpenedFilled,
  IconMapPinFilled,
  IconPhoneFilled,
} from "@tabler/icons-react";

const Page = () => {
  return (
    <div className="min-h-screen flex flex-col items-center  bg-[#f5f5f5]">
      <div className="pt-50 max-w-7xl mx-auto">
        <div className="bg-primary rounded-tl-md rounded-tr-md py-3 px-3 w-full">
          <h3 className="text-white text-2xl font-bold tracking-tight">
            We&apos;d love to hear from you!
          </h3>
        </div>
        <div className="bg-white border shadow grid lg:grid-cols-2 grid-cols-1 gap-10 rounded-bl-md rounded-br-md py-3 px-3 w-full">
          <form className="gap-y-6 flex flex-col mt-5">
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input type="text" placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input type="text" placeholder="Enter last name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="Enter your message..." />
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="terms-2" defaultChecked />
              <div className="grid gap-2">
                <Label htmlFor="terms-2">Accept terms and conditions</Label>
                <p className="text-muted-foreground text-sm">
                  By clicking this checkbox, you agree to Tyre2Go&apos;s{" "}
                  <Link href="/terms" className="text-primary underline">
                    terms and conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary underline">
                    privacy policy
                  </Link>
                  .
                </p>
              </div>
            </div>
            <Button className="ml-auto px-10" size="lg">
              Submit
            </Button>
          </form>
          <div className="bg-[#f5f5f5] p-5">
            <p>
              Do you have questions regarding our products? Your inputs are
              valuable to us. Feel free to send in your inquiries or suggestions
              and we will be happy to reply to you.
            </p>
            <h3 className="mt-5 font-semibold">Contact Us</h3>
            <div className="space-y-3 mt-3">
              <div className="flex text-sm items-center gap-2">
                <IconMailOpenedFilled className="size-4 text-primary" />
                <Link
                  href="mailto:business.202magstires@gmail.com"
                  className="text-primary"
                >
                  business.202magstires@gmail.com
                </Link>
              </div>
              <div className="flex text-sm items-center gap-2">
                <IconPhoneFilled className="size-4 text-primary" />
                <span>+63977 835 5320</span>
              </div>
              <div className="flex text-sm items-center gap-2">
                <IconBrandFacebookFilled className="size-4 text-primary" />
                <Link
                  href="https://www.facebook.com/202magsandtires/"
                  className="text-primary"
                >
                  https://www.facebook.com/202magsandtires/
                </Link>
              </div>
              <div className="flex text-sm items-center gap-2">
                <IconBrandInstagramFilled className="size-4 text-primary" />
                <Link
                  href="https://www.instagram.com/202magstires/?igsh=M3ZzbnZpanExZnl5#"
                  className="text-primary"
                >
                  https://www.instagram.com/202magstires
                </Link>
              </div>
              <div className="flex text-sm items-center gap-2">
                <IconMapPinFilled className="size-4 text-primary" />
                <span>236 N.Domingo Street, San Juan, Philippines</span>
              </div>
            </div>
            <iframe
              className="mt-5"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.86713495341!2d121.02337022578162!3d14.606643676927291!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7aa6dda4927%3A0x2d119ff5fd2d4d92!2s202%20Mags%20and%20Tires!5e0!3m2!1sen!2sph!4v1757572717505!5m2!1sen!2sph"
              width="100%"
              height="150"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
