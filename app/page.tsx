'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, MoreHorizontal, SquarePen, ChevronRight, Image as ImageIcon, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

// lib 폴더 참조를 없애고 직접 연결하여 빌드 에러 원천 봉쇄
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MessageListPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);
      const { data: msgs } = await supabase.from('messages').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
      if (msgs && msgs.length > 0) setLastMessage(msgs[0]);
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans overflow-hidden text-black">
      {/* 헤더 */}
      <header className="px-4 pt-12 pb-2 flex justify-between items-center bg-white sticky top-0 z-[100]">
        <button onClick={() => router.push('/settings')} className="text-[#007AFF] text-[17px] active:opacity-50">편집</button>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-8 h-8 bg-[#F2F2F7] rounded-full flex items-center justify-center text-[#007AFF] active:scale-95">
            <MoreHorizontal size={20} />
          </button>
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-[110]" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 py-1 z-[120] overflow-hidden">
                <button onClick={() => router.push('/gallery')} className="w-full px-4 py-3.5 flex items-center justify-between active:bg-gray-100 border-b border-gray-100">
                  <span className="text-[16px]">사진첩</span>
                  <ImageIcon size={18} className="text-gray-400" />
                </button>
                <button onClick={() => router.push('/timeline')} className="w-full px-4 py-3.5 flex items-center justify-between active:bg-gray-100">
                  <span className="text-[16px]">알람 설정</span>
                  <Clock size={18} className="text-gray-400" />
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* 검색창 */}
      <div className="px-4 pb-4 bg-white">
        <h1 className="text-[34px] font-bold tracking-tight mb-2">메시지</h1>
        <div className="relative flex items-center bg-[#E9E9EB] rounded-lg px-2 py-1.5">
          <Search size={18} className="text-[#8E8E93] mr-1.5" />
          <input className="bg-transparent outline-none text-[17px] w-full text-black" placeholder="검색" />
        </div>
      </div>

      {/* 목록 */}
      <main className="flex-1 overflow-y-auto">
        <div onClick={() => router.push('/chat')} className="flex items-center px-4 py-3 active:bg-gray-100 cursor-pointer">
          <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden border border-black/5 shrink-0">
            {profile?.avatar_url && <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />}
          </div>
          <div className="ml-3 flex-1 border-b border-gray-100 pb-3">
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-bold text-[16px]">{profile?.character_name || '대화 상대'}</span>
              <span className="text-[13px] text-gray-500">{lastMessage ? '오후 4:41' : ''}</span>
            </div>
            <div className="flex justify-between items-center text-[14px]">
              <p className="text-gray-500 line-clamp-2 leading-snug pr-4">{lastMessage?.content || '새로운 대화를 시작해보세요.'}</p>
              <ChevronRight size={16} className="text-[#C7C7CC] shrink-0" />
            </div>
          </div>
        </div>
      </main>

      {/* 하단 버튼 */}
      <div className="p-4 flex justify-end sticky bottom-0 pointer-events-none">
        <button onClick={() => router.push('/chat')} className="pointer-events-auto w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-[#007AFF] active:scale-95">
          <SquarePen size={24} />
        </button>
      </div>
    </div>
  );
}
