/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

// 개발 환경(next dev)에서 Cloudflare 플랫폼(KV, D1 등) 시뮬레이션 지원
if (process.env.NODE_ENV === 'development') {
    try {
        const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');
        setupDevPlatform();
    } catch (e) {
        // 모듈이 없거나 로드 실패 시 무시 (일반 Next.js 모드로 실행)
        console.warn('Note: @cloudflare/next-on-pages/next-dev not loaded.');
    }
}

module.exports = nextConfig;
