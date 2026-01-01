'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/chat');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
}
