import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required: keeps WASM binaries loadable from node_modules at runtime
  serverExternalPackages: ["@captain-sdk/pdf-parser"],
  webpack(config, { isServer }) {
    // Prevent webpack from trying to bundle Node.js built-ins in the client bundle
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false, crypto: false };
    }
    return config;
  },
};

export default nextConfig;
