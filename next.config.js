/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 호환성을 위한 이미지 설정
  images: {
    unoptimized: true,
  },
  // 빌드 시 TypeScript 에러 무시
  typescript: {
    ignoreBuildErrors: true,
  },
  // 빌드 시 ESLint 에러 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
