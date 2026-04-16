import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* your config options */

  // async rewrites() {
  //   return [
  //     {
  //       source: "/localapi/:path*",
  //       destination: "http://localhost:5050/:path*", // ⭐ Bypass CORS → Smart Card Agent
  //     },
  //     {
  //       source: "/fingeragent/:path*",
  //       destination: "http://localhost:5051/:path*", // ⭐ Optional → Fingerprint Agent
  //     },
  //   ];
  // },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
