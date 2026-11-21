import type { NextConfig } from "next";

// The staging preview serves the app under a path prefix and passes it here without a trailing
// slash (the stack's preview recipe); unset, the app is served at the root.
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  basePath,
  // The Docker image runs the standalone server (Dockerfile).
  output: "standalone",
  reactStrictMode: true,
  // Client code builds URLs to the API with it (src/lib/paths.ts).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // The migrations are read at run time, and the SQLite driver loads its platform library by a
  // computed name, which the standalone output's file tracing does not follow.
  outputFileTracingIncludes: {
    "/**": ["./drizzle/**", "./node_modules/@libsql/*/**"],
  },
};

export default nextConfig;
