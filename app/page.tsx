'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Settings, 
  Image as ImageIcon, 
  Clock, 
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MessageListPage() {
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
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans overflow-hidden">
      {/* 헤더: 아이폰 메시지 앱 스타일 */}
      <header className="px-4 pt-12 pb-2 flex justify-between items-center bg-[#F2F2F7]/80 backdrop-blur-md sticky top-0 z-50">
        <button className="text-[#007AFF] text-[17px]">편집</button>
        <button 
          onClick={() => router.push('/settings')}
          className="text-[#007AFF] p-1"
        >
          <Settings size={24} />
        </button>
      </header>

      <div className="px-4 pb-2 bg-[#F2F2F7]">
        <h1 className="text-[34px] font-bold tracking-tight mb-2 text-black">메시지</h1>
        <div className="relative flex items-center bg-[#E3E3E8] rounded-lg px-2 py-1.5 mb-4">
          <Search size={18} className="text-[#8E8E93] mr-1.5" />
          <input className="bg-transparent outline-none text-[17px] w-full text-black" placeholder="검색" />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-white rounded-t-[20px] shadow-inner">
        {/* 바로가기 메뉴 섹션: 안 눌릴 수 없는 구조 */}
        <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-100">
          <button 
            onClick={() => router.push('/gallery')}
            className="flex flex-col items-center justify-center p-4 bg-[#F2F2F7] rounded-2xl active:scale-95 transition-transform"
          >
            <ImageIcon className="text-[#007AFF] mb-2" size={28} />
            <span className="text-[13px] font-medium text-black">사진첩 관리</span>
          </button>
          <button 
            onClick={() => router.push('/timeline')}
            className="flex flex-col items-center justify-center p-4 bg-[#F2F2F7] rounded-2xl active:scale-95 transition-transform"
          >
            <Clock className="text-[#34C759] mb-2" size={28} />
            <span className="text-[13px] font-medium text-black">선톡 설정</span>
          </button>
        </div>

        {/* 대화 리스트 */}
        <div 
          onClick={() => router.push('/chat')} 
          className="flex items-center px-4 py-4 active:bg-gray-100 cursor-pointer border-b border-gray-50 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border border-black/5 shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="pfp" />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold text-xl">
                {profile?.character_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="ml-4 flex-1">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-bold text-[17px] text-black">{profile?.character_name || '대화 상대'}</span>
              <span className="text-[14px] text-[#8E8E93]">
                {lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[15px] text-[#8E8E93] line-clamp-2 leading-tight pr-6">
                {lastMessage?.content || '새로운 대화를 시작해보세요.'}
              </p>
              <ChevronRight size={18} className="text-[#C7C7CC] shrink-0" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
