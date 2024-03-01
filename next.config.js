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
        hostname: "16chan.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "16chan-mini.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "16chan-raw.s3.us-east-2.amazonaws.com",
      },
    ],
  },
};

export default config;
