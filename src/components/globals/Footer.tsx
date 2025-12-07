import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="bg-secondary py-5 px-4 sm:px-6 md:px-8 lg:px-30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <p className='text-muted-foreground font-medium text-sm md:text-base text-center md:text-left'>© 2025 <span className='text-primary'>Tyre2Go</span>. All rights reserved.</p>
        <div className="font-medium text-muted-foreground flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-5 text-xs sm:text-sm">
          <Link className='hover:text-primary' href="/contact-us">Contact Us</Link>
          <span className="hidden sm:inline">|</span>
          <Link className='hover:text-primary' href="/sign-in">Sign In</Link>
          <span className="hidden sm:inline">|</span>
          <Link className='hover:text-primary' href="/track-order">Tracking of Order</Link>
          <span className="hidden sm:inline">|</span>
          <Link className='hover:text-primary' href="/privacy-policy">Privacy Policy</Link>
          <span className="hidden sm:inline">|</span>
          <Link className='hover:text-primary' href="/terms-and-conditions">Terms and Conditions</Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
