import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow images from Cloudinary (if needed for thumbnails later)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'vz-cbc45619-72d.b-cdn.net',
      },
    ],
  },
};

export default nextConfig;
