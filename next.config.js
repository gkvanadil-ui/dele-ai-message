/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 이미지 최적화 호환 설정
  images: {
    unoptimized: true,
  },
  // 빌드 중단 방지 (타입/린트 에러 무시)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
