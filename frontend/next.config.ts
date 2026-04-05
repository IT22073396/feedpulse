import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
    resolveAlias: {
      // Explicitly point to the frontend's own tailwindcss installation
      // so Turbopack never looks in parent directories for it.
      tailwindcss: path.resolve(__dirname, "node_modules/tailwindcss"),
    },
  },

  // Fallback webpack config (used when not running with --turbo)
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/node_modules/**", "**/.git/**"],
        poll: false,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
