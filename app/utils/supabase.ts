import { createClient } from '@supabase/supabase-js';

// 환경 변수 검증 (빌드 타임에는 경고만 출력하고 넘어감, 런타임에는 에러)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  // 빌드 환경(CI/CD)에서 환경변수가 없을 때 터지지 않도록 처리하되 로그만 남김
  if (typeof window !== 'undefined') {
    console.error('Supabase 환경 변수가 설정되지 않았습니다.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
