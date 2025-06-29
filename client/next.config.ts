import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
        {
            protocol: "https",
            hostname: "example.com",
            port: "",
            pathname: "/**",
        },
        {
        protocol: "https",
        hostname: "*.amazonaws.com",
        port: "",
        pathname: "/**",
        }
    ],
  }
};

export default nextConfig;
