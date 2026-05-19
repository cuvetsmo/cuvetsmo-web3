import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Silence the "multiple lockfiles" warning by pinning Turbopack's root
  // to this project (Palm has a stray lockfile in C:\Users\palmz\).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
