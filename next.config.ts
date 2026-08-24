import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required: keeps WASM binaries loadable from node_modules at runtime
  serverExternalPackages: ["@captain-sdk/pdf-parser"],
};

export default nextConfig;
