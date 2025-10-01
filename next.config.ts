import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    domains: [
      "gogulong.ph",
      "firebasestorage.googleapis.com",
      "erp-ncst.s3.us-east-1.amazonaws.com",
      "images.unsplash.com",
      "images.pexels.com",
      "adzktgbqdq.cloudimg.io",
      "yokohamatire.ph",
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
