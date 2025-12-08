import React from "react";
import Navbar from "@/components/globals/Navbar";
import Footer from '@/components/globals/Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div>
      <Navbar />
      <main className='lg:pt-0 pt-20'>{children}</main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
