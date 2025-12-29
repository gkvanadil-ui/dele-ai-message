'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      const { data: m } = await supabase.from('messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
      if (m) setMessages(m);
    };
    init();
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !profile) return;
    const userMsg = { content: input, is_from_user: true, user_id: profile.id };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ userId: profile.id, message: input, history: messages.slice(-5) })
    });
    const data = await res.json();
    const aiMsg = { content: data.m, is_from_user: false, user_id: profile.id };
    setMessages(prev => [...prev, aiMsg]);
    await supabase.from('messages').insert([userMsg, aiMsg]);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] border-x shadow-2xl relative">
      {/* 헤더: 캐릭터 이름 강조 */}
      <header className="p-4 bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 flex items-center justify-between">
        <Link href="/"><ChevronLeft className="text-gray-600" /></Link>
        <div className="text-lg font-extrabold text-gray-800">{profile?.character_name || "대화 중..."}</div>
        <Link href="/settings" className="text-xs text-gray-400">설정</Link>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.is_from_user ? 'justify-end' : 'justify-start'}`}>
            {!m.is_from_user && (
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0 flex items-center justify-center text-[10px] text-white">
                {profile?.character_name?.[0]}
              </div>
            )}
            <div className={`p-3 rounded-2xl text-[15px] max-w-[75%] shadow-sm leading-relaxed ${
              m.is_from_user ? 'bg-[#34C759] text-white rounded-tr-none' : 'bg-white text-black border border-gray-100 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* 입력창: 하단 고정 및 라운드 디자인 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t flex gap-2 items-center">
        <input 
          className="flex-1 border-none bg-gray-100 rounded-2xl px-4 py-3 text-[15px] outline-none focus:ring-1 ring-green-400 transition-all" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={`${profile?.character_name || '캐릭터'}에게 메시지 보내기...`} 
        />
        <button onClick={send} className="bg-[#34C759] text-white p-3 rounded-2xl shadow-md active:scale-95 transition-transform">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
