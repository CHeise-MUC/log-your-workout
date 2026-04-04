import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The API URL can be overridden per environment via .env files
  env: {
    API_URL: process.env.API_URL ?? "http://localhost:3001",
  },
};

export default nextConfig;
