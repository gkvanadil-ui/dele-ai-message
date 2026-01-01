export const runtime = 'edge';

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-neutral-50 dark:bg-neutral-900">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white text-center">
          Cloudflare Pages + Next.js 14.3.0
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-center max-w-lg">
          Dependency 충돌이 해결된 Edge Runtime 환경입니다.<br/>
          아래 버튼을 눌러 채팅 페이지로 이동하세요.
        </p>

        <Link 
          href="/chat"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200"
        >
          채팅 시작하기
        </Link>
      </div>
    </main>
  );
}
