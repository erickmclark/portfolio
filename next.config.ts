import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'qdghepacnxxksvfb.public.blob.vercel-storage.com', pathname: '/projects/**' },
    ],
  },
};

export default nextConfig;
