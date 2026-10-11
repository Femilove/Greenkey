import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Listing photos now upload straight to Cloudinary.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
