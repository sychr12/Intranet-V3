import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignora erros do ESLint durante o build (útil no Docker)
  },
};

export default nextConfig;
