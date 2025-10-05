// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;


// const nextConfig = {
//   eslint: {
//     // Warning: This allows production builds to successfully complete even if
//     // your project has ESLint errors.
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     // Warning: This allows production builds to successfully complete even if
//     // your project has TypeScript errors.
//     ignoreBuildErrors: true,
//   },
// }

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig

