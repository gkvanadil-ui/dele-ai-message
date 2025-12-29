'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const autoLogin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // 세션이 없으면 익명으로 바로 로그인 시킴
      if (!session) {
        await supabase.auth.signInAnonymously();
      }
    };
    autoLogin();
  }, []);

  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
