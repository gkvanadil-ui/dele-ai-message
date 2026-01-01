'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/chat');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-gray-500">Loading Chat...</div>
    </div>
  );
}
