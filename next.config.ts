import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'github.com' },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:7341', process.env.NEXT_PUBLIC_APP_URL ?? ''],
    },
  },
};

export default nextConfig;
