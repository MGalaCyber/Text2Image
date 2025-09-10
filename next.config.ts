import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.galaxd.com",
        pathname: "**"
      }
    ]
  }
};

export default nextConfig;
