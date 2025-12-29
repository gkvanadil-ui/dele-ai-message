'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initAuth = async () => {
      // 이미 세션이 있는지 확인
      const { data: { session } } = await supabase.auth.getSession();
      
      // 세션이 없으면 즉시 익명 로그인 시도
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) console.error("로그인 실패:", error.message);
      }
    };
    initAuth();
  }, []);

  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
