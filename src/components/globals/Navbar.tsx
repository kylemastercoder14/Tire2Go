"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { ChevronDown, LifeBuoy, User } from "lucide-react";

const Navbar = () => {
  const { isSignedIn } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const menuItems = [
    {
      name: "Products",
      items: [
        {
          label: "Clearance Sale",
          url: "clearance-sale",
        },
        {
          label: "Promos",
          url: "promos",
        },
        {
          label: "Brands",
          url: "brands",
        },
      ],
    },
    {
      name: "Resources",
      items: [
        {
          label: "Tips & Advice",
          url: "tips-and-advice",
        },
        {
          label: "FAQs",
          url: "faqs",
        },
        {
          label: "Car Models",
          url: "car-models",
        },
      ],
    },
  ];

  return (
    <div className="w-full fixed top-0 inset-x-0 z-50">
      {/* Top bar with contact info */}
      <div className="w-full bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-6 text-sm text-white">
              <Link
                href="tel:+639778355320"
                className="hover:text-white/80 transition-colors"
              >
                +63977 835 5320
              </Link>
              <Link
                href="mailto:business.202magstires@gmail.com"
                className="hover:text-white/80 transition-colors hidden md:block"
              >
                business.202magstires@gmail.com
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Link
                  target="_blank"
                  href="https://www.facebook.com/202magsandtires/"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                  </svg>
                </Link>
                <Link
                  target="_blank"
                  href="https://www.instagram.com/202magstires?igsh=M3ZzbnZpanExZnl5"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar - Dark */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="202 MAGS&TIRES"
                width={120}
                height={120}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {menuItems.map((menu, idx) => (
                <div
                  key={idx}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(idx)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-4 py-2 text-black hover:text-primary transition-colors text-sm font-medium">
                    {menu.name}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {openDropdown === idx && (
                    <div className="absolute top-full left-0 mt-0 w-48 bg-white shadow-xl">
                      <div className="py-2">
                        {menu.items.map((item, itemIdx) => (
                          <Link
                            key={itemIdx}
                            href={`/${item.url}`}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <Link
                href="/about-us"
                className="px-4 py-2 text-black hover:text-primary transition-colors text-sm font-medium"
              >
                About Us
              </Link>
              <Link
                href="/contact-us"
                className="px-4 py-2 text-black hover:text-primary transition-colors text-sm font-medium"
              >
                Contact Us
              </Link>
              <Link
                href="/feedback"
                className="px-4 py-2 text-black hover:text-primary transition-colors text-sm font-medium"
              >
                Feedback
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/tire-selector"
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded font-medium text-sm transition-colors flex items-center gap-2"
              >
                <LifeBuoy className="size-4" />
                Tire selector
              </Link>
              {isSignedIn ? (
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Link
                      href="/order-history"
                      label="Order History"
                      labelIcon={
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      }
                    />
                  </UserButton.MenuItems>
                </UserButton>
              ) : (
                <Link
                  href="/sign-in"
                  className="border border-primary text-primary px-4 py-2.5 rounded font-medium text-sm transition-colors flex items-center gap-2"
                >
                  <User className="size-4" />
                  Sign in
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-black p-2"
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
        </div>
      </nav>

            {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {menuItems.map((menu, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-2 mb-2">
                <div className="font-medium text-gray-900 px-3 py-2">
                  {menu.name}
                </div>
                {menu.items.map((item, itemIdx) => (
                  <Link
                    key={itemIdx}
                    href={`/${item.url}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-6 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
            <Link
              href="/about-us"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50"
            >
              About Us
            </Link>
            <Link
              href="/contact-us"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50"
            >
              Contact Us
            </Link>
            <Link
              href="/feedback"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50"
            >
              Feedback
            </Link>
            <div className="pt-3 space-y-2">
              {isSignedIn ? (
                <div className="px-3 py-2">
                  <UserButton />
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setIsMenuOpen(false)}
                  className="block border border-primary text-primary px-4 py-2.5 rounded font-medium text-center"
                >
                  Sign In
                </Link>
              )}
              <Link
                href="/tire-selector"
                onClick={() => setIsMenuOpen(false)}
                className="block bg-primary text-white px-4 py-2.5 rounded font-medium text-center"
              >
                Tire selector
              </Link>
              <Link
                href="/find-dealer"
                onClick={() => setIsMenuOpen(false)}
                className="block bg-gray-700 text-white px-4 py-2 rounded font-medium text-center"
              >
                Find a dealer
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
