"use client";

import React from "react";
import Navbar from "@/components/globals/Navbar";
import Footer from "@/components/globals/Footer";
import { useCheckProfile } from "@/hooks/use-check-profile";
import { LoaderOne } from "@/components/globals/Loader";
import ChatApp from '@/components/globals/ChatApp';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useCheckProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderOne />
      </div>
    );
  }
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ChatApp />
    </div>
  );
};

export default RootLayout;
