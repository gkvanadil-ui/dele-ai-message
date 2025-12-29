'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, MoreHorizontal, SquarePen, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function MessageListPage() {
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans text-black overflow-hidden">
      <header className="px-4 pt-12 pb-2 flex justify-between items-center bg-white sticky top-0">
        <button onClick={() => router.push('/settings')} className="text-[#007AFF] text-[17px]">편집</button>
        <button className="w-8 h-8 bg-[#F2F2F7] rounded-full flex items-center justify-center text-[#007AFF]">
          <MoreHorizontal size={20} />
        </button>
      </header>
      <div className="px-4 pb-4 bg-white">
        <h1 className="text-[34px] font-bold tracking-tight mb-2">메시지</h1>
        <div className="relative flex items-center bg-[#E9E9EB] rounded-lg px-2 py-1.5">
          <Search size={18} className="text-[#8E8E93] mr-1.5" />
          <input className="bg-transparent outline-none text-[17px] w-full text-black" placeholder="검색" />
        </div>
      </div>
      <main className="flex-1 overflow-y-auto">
        <div onClick={() => router.push('/chat')} className="flex items-center px-4 py-3 active:bg-gray-100 cursor-pointer border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
            {profile?.avatar_url && <img src={profile.avatar_url} className="w-full h-full object-cover" />}
          </div>
          <div className="ml-3 flex-1 flex justify-between items-center">
            <div>
              <div className="font-bold text-[16px] text-black">{profile?.character_name || '대화 상대'}</div>
              <p className="text-gray-500 text-[14px]">새 메시지 없음</p>
            </div>
            <ChevronRight size={16} className="text-[#C7C7CC]" />
          </div>
        </div>
      </main>
      <div className="p-4 flex justify-end sticky bottom-0">
        <button onClick={() => router.push('/chat')} className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-[#007AFF]">
          <SquarePen size={24} />
        </button>
      </div>
    </div>
  );
}
