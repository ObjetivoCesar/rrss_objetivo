import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/brand-planner": [
      "../../Jarvis/**/*"
    ]
  },
  outputFileTracingExcludes: {
    "/api/brand-planner": [
      "../../packages/expert-lens-pipeline-module/public/**/*",
      "../../packages/expert-lens-pipeline-module.zip",
      "../../hyper-demo/**/*",
      "../../Audios/**/*",
      "../../tmp/**/*",
      "../../tmp_orig.wav",
      "../../public/**/*",
      "./public/**/*"
    ]
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-donna-secret" },
        ]
      }
    ]
  }
};

export default nextConfig;
// Cache bust: 1
