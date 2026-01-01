/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 이미지 최적화 비활성화 (필수)
  images: {
    unoptimized: true,
  },
  // 타입/린트 에러로 인한 빌드 실패 방지
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
