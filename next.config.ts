import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this repo. Without this, Next.js 16 walks
  // up the filesystem and may pick a parent-directory lockfile as the
  // root, which produces a build warning.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
