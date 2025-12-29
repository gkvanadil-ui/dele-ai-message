'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  MoreHorizontal, 
  MessageSquare, 
  Image as ImageIcon, 
  Clock, 
  SquarePen,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    <div className="relative flex flex-col h-screen max-w-md mx-auto bg-white font-sans overflow-hidden">
      {/* 헤더 부분: z-index 50으로 상향 */}
      <header className="px-4 pt-12 pb-2 flex justify-between items-center bg-white border-b sticky top-0 z-[50]">
        <button className="text-[#007AFF] text-[17px]">편집</button>
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="w-8 h-8 bg-[#F2F2F7] rounded-full flex items-center justify-center text-[#007AFF] active:scale-90"
          >
            <MoreHorizontal size={20} />
          </button>

          {/* 팝업 메뉴: z-[100]으로 극단적으로 높임 */}
          {isMenuOpen && (
            <>
              {/* 클릭 방지 배경 레이어 */}
              <div 
                className="fixed inset-0 z-[90] bg-black/5" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200 py-1 z-[100] overflow-hidden">
                <button 
                  onMouseDown={() => router.push('/chat')}
                  className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-100 border-b border-gray-100 text-left"
                >
                  <span className="text-[16px] text-black">메시지</span>
                  <MessageSquare size={18} className="text-gray-400" />
                </button>
                <button 
                  onMouseDown={() => router.push('/gallery')}
                  className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-100 border-b border-gray-100 text-left"
                >
                  <span className="text-[16px] text-black">사진첩</span>
                  <ImageIcon size={18} className="text-gray-400" />
                </button>
                <button 
                  onMouseDown={() => router.push('/timeline')}
                  className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-100 text-left"
                >
                  <span className="text-[16px] text-black">타임라인</span>
                  <Clock size={18} className="text-gray-400" />
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* 리스트 본문 */}
      <div className="px-4 pb-4 bg-white">
        <h1 className="text-[34px] font-bold tracking-tight mb-2">메시지</h1>
        <div className="relative flex items-center bg-[#E9E9EB] rounded-lg px-2 py-1.5">
          <Search size={18} className="text-gray-500 mr-1.5" />
          <input className="bg-transparent outline-none text-[17px] w-full" placeholder="검색" />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div onClick={() => router.push('/chat')} className="flex items-center px-4 py-3 active:bg-gray-100 cursor-pointer group">
          <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden border border-black/5 shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold">
                {profile?.character_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="ml-3 flex-1 border-b border-gray-100 pb-3 group-last:border-none">
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-bold text-[16px]">{profile?.character_name || '대화 상대'}</span>
              <span className="text-[14px] text-gray-500">
                {lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
            <p className="text-[14px] text-gray-500 line-clamp-2 pr-4">
              {lastMessage?.content || '새로운 대화를 시작해보세요.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
