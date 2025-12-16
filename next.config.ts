import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/**",
      },
    ],
    unoptimized: true, // <-- добавь эту строку (отключает оптимизацию Next.js, чтобы постеры грузились напрямую от TMDB без задержек)
  },
};

export default nextConfig;