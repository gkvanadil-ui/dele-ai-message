'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

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
    if (!input || !profile) return;
    const userMsg = { content: input, is_from_user: true, user_id: profile.id };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ userId: profile.id, message: input, history: [] })
    });
    const data = await res.json();
    const aiMsg = { content: data.m, is_from_user: false, user_id: profile.id };
    setMessages(prev => [...prev, aiMsg]);
    await supabase.from('messages').insert([userMsg, aiMsg]);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] border-x shadow-xl">
      <header className="p-4 bg-white border-b sticky top-0 font-bold text-center text-lg text-gray-800">
        {profile?.character_name || "채팅"}
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.is_from_user ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl text-[15px] max-w-[80%] shadow-sm ${
              m.is_from_user ? 'bg-[#34C759] text-white' : 'bg-white text-black border'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className="p-4 bg-white border-t flex gap-2 pb-8">
        <input className="flex-1 border rounded-full px-4 py-2 bg-gray-50 outline-none focus:ring-1 ring-green-500" 
          value={input} onChange={e => setInput(e.target.value)} placeholder="메시지를 입력하세요..." />
        <button onClick={send} className="bg-[#34C759] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">↑</button>
      </div>
    </div>
  );
}
