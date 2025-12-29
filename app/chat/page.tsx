'use client';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Info, Send } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. 초기 데이터 및 세션 로드
  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 프로필(캐릭터 정보) 가져오기
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);

      // 이전 대화 내역 로드
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (msgs) setMessages(msgs);
    };
    initChat();
  }, []);

  // 2. 메시지 전송 시 자동 스크롤
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. 메시지 전송 및 AI 응답 처리
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const userMsg = { content: input, is_from_user: true, user_id: user.id };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // API 호출 (사용자 설정과 대화 내역 전달)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: input }],
          userId: user.id
        })
      });

      const aiMsg = await res.json();
      if (aiMsg) setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("대화 에러:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans overflow-hidden">
      {/* 상단 헤더: 아이폰 스타일 */}
      <header className="px-4 pt-12 pb-3 flex justify-between items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <Link href="/" className="text-[#007AFF] flex items-center shrink-0">
          <ChevronLeft size={28} />
          <span className="text-[17px] -ml-1">목록</span>
        </Link>
        <div className="flex flex-col items-center flex-1">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 mb-0.5">
            {profile?.avatar_url && <img src={profile.avatar_url} className="w-full h-full object-cover" alt="pfp" />}
          </div>
          <span className="text-[11px] font-medium text-gray-800">{profile?.character_name || '캐릭터'}</span>
        </div>
        <Link href="/settings" className="text-[#007AFF] shrink-0">
          <Info size={24} />
        </Link>
      </header>

      {/* 채팅 본문 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.is_from_user ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-[20px] text-[15px] leading-tight shadow-sm
              ${msg.is_from_user 
                ? 'bg-[#007AFF] text-white rounded-br-none' 
                : 'bg-[#E9E9EB] text-black rounded-bl-none'}`}
            >
              {/* AI가 보낸 이미지가 있는 경우 출력 */}
              {msg.image_url && (
                <div className="mb-2 -mx-2 -mt-1 rounded-lg overflow-hidden border border-black/5">
                  <img src={msg.image_url} className="w-full h-auto" alt="sent content" />
                </div>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </main>

      {/* 입력창 */}
      <footer className="p-2 pb-8 bg-white border-t">
        <form onSubmit={sendMessage} className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F2F7] rounded-full border border-gray-200">
          <input 
            className="flex-1 bg-transparent outline-none text-[15px] py-1"
            placeholder="iMessage"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="w-8 h-8 bg-[#007AFF] text-white rounded-full flex items-center justify-center disabled:bg-gray-300 transition-colors"
          >
            <Send size={16} fill="white" />
          </button>
        </form>
      </footer>
    </div>
  );
}
