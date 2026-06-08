import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sql.js'],
  typescript: {
    // Types are checked locally; skip on server to avoid missing @types packages
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
