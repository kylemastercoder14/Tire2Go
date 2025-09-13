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
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
