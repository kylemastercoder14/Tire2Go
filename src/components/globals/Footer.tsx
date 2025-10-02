import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="bg-secondary py-5 px-30">
      <div className="flex items-center justify-between">
        <p className='text-muted-foreground font-medium'>© 2025 <span className='text-primary'>Tire2Go</span>. All rights reserved.</p>
        <div className="font-medium text-muted-foreground flex items-center justify-center gap-5">
          <Link className='hover:text-primary' href="/contact-us">Contact Us</Link>
          <p>|</p>
          <Link className='hover:text-primary' href="/sign-in">Sign In</Link>
          <p>|</p>
          <Link className='hover:text-primary' href="/track-order">Tracking of Order</Link>
          <p>|</p>
          <Link className='hover:text-primary' href="/feedback">Feedback</Link>
          <p>|</p>
          <Link className='hover:text-primary' href="/privacy-policy">Privacy Policy</Link>
          <p>|</p>
          <Link className='hover:text-primary' href="/terms-and-conditions">Terms and Conditions</Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
