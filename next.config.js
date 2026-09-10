/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  images: {
    remotePatterns: [
      {
        hostname: '194.163.167.131',
      },
      {
        hostname: 'localhost',
      },
      {
        hostname: '5.252.53.111',
      },
      {
        hostname: '127.0.0.1',
      },
      {
        hostname: '10.12.72.80',
      },
      {
        hostname: 'w7.pngwing.com',
      },
      {
        hostname: 'www.pngwing.com',
      },
      {
        hostname: 'lh3.googleusercontent.com',
      },
      {
        hostname: 'github.com',
      },
    ],
  },
  experimental: {
    // typedRoutes: true,
    // webpackBuildWorker: true,
  },
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
