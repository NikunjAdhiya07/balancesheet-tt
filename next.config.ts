import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "puppeteer"],
  devIndicators: false,
};

export default nextConfig;
