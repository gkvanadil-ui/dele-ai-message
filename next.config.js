/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages(Edge)는 기본 이미지 최적화를 지원하지 않으므로 비활성화하거나 커스텀 로더 사용 필요
  images: {
    unoptimized: true,
  },
  // React Strict Mode 활성화
  reactStrictMode: true,
};

// 개발 환경에서 Cloudflare 플랫폼 시뮬레이션 (선택 사항)
if (process.env.NODE_ENV === 'development') {
  try {
    const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');
    setupDevPlatform();
  } catch (e) {
    // 모듈이 없거나 로드 실패 시 무시 (일반 next dev 실행)
    console.warn('Failed to load @cloudflare/next-on-pages/next-dev, skipping setup.');
  }
}

module.exports = nextConfig;
