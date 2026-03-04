/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/loadout',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
