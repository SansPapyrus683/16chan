/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d3amn9wapqcuo1.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "d34j7afe9569nm.cloudfront.net",
      },
    ],
  },
};

export default config;
