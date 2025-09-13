"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import React, { useState } from "react";
import { cn } from '@/lib/utils';

const Navbar = () => {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="w-full fixed bg-white top-0 inset-x-0 z-50">
      {/* Top bar with contact info */}
      <div className=" w-full flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="202 MAGS&TIRES"
            className="ml-12 mt-2 lg:hidden block"
            width={110}
            height={110}
          />
        </Link>
        <div className="space-x-6 relative lg:w-[75%] w-[20%] bg-primary text-xs font-medium lg:ml-auto h-full px-7 py-1 text-white">
          <div
            className="bg-primary w-10 absolute top-0 -left-10 h-full"
            style={{ clipPath: "polygon(100% 0, 80% 0, 100% 100%)" }}
          ></div>
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-accent/20 p-3 rounded-full focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
          <div className="lg:flex hidden items-center gap-3 justify-end">
            <Link
              href="mailto:business.202magstires@gmail.com"
              title="business.202magstires@gmail.com"
            >
              business.202magstires@gmail.com
            </Link>
            <span>|</span>
            <Link href="tel:+639778355320" title="+63977 835 5320">
              +63977 835 5320
            </Link>
            <span>|</span>
            <Link
              target="_blank"
              href="https://share.google/DG9epCw1lxSyrSPGF"
              title="236 N.Domingo Street, San Juan, Philippines"
            >
              236 N.Domingo Street, San Juan, Philippines
            </Link>
            <span>|</span>
            <div className="flex items-center gap-3">
              <Link
                target="_blank"
                href="https://www.facebook.com/202magsandtires/"
                title="Facebook Page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-hidden="true"
                  fill="white"
                  className="v-icon__svg"
                  style={{
                    fontSize: "14px",
                    height: "14px",
                    width: "14px",
                  }}
                >
                  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"></path>
                </svg>
              </Link>
              <Link
                target="_blank"
                href="https://www.instagram.com/202magstires?igsh=M3ZzbnZpanExZnl5"
                title="Instagram Page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-hidden="true"
                  fill="white"
                  className="v-icon__svg"
                  style={{ fontSize: "14px", height: "14px", width: "14px" }}
                >
                  <path d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-white lg:block hidden shadow-md border-b">
        <div className="px-20">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">
              <Image
                src="/logo.png"
                alt="202 MAGS&TIRES"
                width={140}
                height={140}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex font-medium items-center pr-10 space-x-8">
              <a
                href="/clearance-sale"
                className={cn("text-gray-700 hover:text-primary transition-colors duration-200", pathname === '/clearance-sale' && 'text-primary')}
              >
                Clearance Sale
              </a>
              <a
                href="/promos"
                className={cn("text-gray-700 hover:text-primary transition-colors duration-200", pathname === '/promos' && 'text-primary')}
              >
                Promos
              </a>
              <a
                href="/brands"
                className={cn("text-gray-700 hover:text-primary transition-colors duration-200", pathname === '/brands' && 'text-primary')}
              >
                Brands
              </a>
              <a
                href="/car-models"
                className={cn("text-gray-700 hover:text-primary transition-colors duration-200", pathname === '/car-models' && 'text-primary')}
              >
                Car Models
              </a>
              <a
                href="/tips-and-advice"
                className={cn("text-gray-700 hover:text-primary transition-colors duration-200", pathname === '/tips-and-advice' && 'text-primary')}
              >
                Tips & Advice
              </a>
              <a
                href="/faqs"
                className={cn("text-gray-700 hover:text-primary transition-colors duration-200", pathname === '/faqs' && 'text-primary')}
              >
                FAQs
              </a>
              <a
                href="/about-us"
                className={cn("text-gray-700 hover:text-primary transition-colors duration-200", pathname === '/about-us' && 'text-primary')}
              >
                About Us
              </a>
              {isSignedIn && <UserButton />}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            <a
              href="#"
              className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 transition-colors duration-200"
            >
              Clearance Sale
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 transition-colors duration-200"
            >
              Promos
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 transition-colors duration-200"
            >
              Brands
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 transition-colors duration-200"
            >
              Installation Sites
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 transition-colors duration-200"
            >
              Car Models
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 transition-colors duration-200"
            >
              Tips & Advice
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 transition-colors duration-200"
            >
              About Us
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
