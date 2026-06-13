import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sql.js'],
  typescript: {
    // Types are checked locally; skip on server to avoid missing @types packages
    ignoreBuildErrors: true,
  },
  experimental: {
    // Limite les workers parallèles pour O2Switch (limites de processus shared hosting)
    cpus: 1,
  },
};

export default nextConfig;
