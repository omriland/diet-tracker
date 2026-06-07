import type { NextConfig } from "next";

// Stamp every build with a version the client can compare against at runtime.
// On Vercel this is the commit SHA; locally it falls back to the build time.
const buildId =
  process.env.VERCEL_GIT_COMMIT_SHA ?? `dev-${Date.now().toString(36)}`;

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
};

export default nextConfig;
