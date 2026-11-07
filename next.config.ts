import type { NextConfig } from "next";
import { LEGACY_SLUG_REDIRECTS } from "./lib/home-view";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'qdghepacnxxksvfb.public.blob.vercel-storage.com', pathname: '/projects/**' },
    ],
  },
  async redirects() {
    return Object.entries(LEGACY_SLUG_REDIRECTS).map(([legacy, target]) => ({
      source: `/work/${legacy}`,
      destination: `/work/${target}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
