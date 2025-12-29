'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function ChatRoom() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 메시지 및 히스토리 불러오기
  const loadMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => { loadMessages(); }, []);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // 마지막 발화자가 AI인지 확인 (iOS: isLastMessageFromAI 대체)
  const checkLastFromAI = () => {
    if (messages.length === 0) return false;
    return !messages[messages.length - 1].is_from_user;
  };

  const handleSend = async (text: string, img: string | null = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. 유저 메시지 DB 저장
    const userMsg = { user_id: user.id, content: text, image_url: img, is_from_user: true };
    await supabase.from('messages').insert(userMsg);
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // 2. AI 응답 호출
    setIsTyping(true);
    const historyText = messages.slice(-10).map(m => `${m.is_from_user ? '[Mom]':'[Hiyori]'}: ${m.content}`).join('\n');
    
    // 서운함 모드 로직 (iOS 수정사항 반영)
    let mission = text;
    if (checkLastFromAI()) {
       mission = `(엄마가 아직 답장을 안 함) ${text}`;
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id, message: mission, history: historyText, imageUrl: img })
    });
    const data = await res.json();

    // 3. AI 응답 저장
    const aiMsg = { user_id: user.id, content: data.m, is_from_user: false };
    await supabase.from('messages').insert(aiMsg);
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F5] max-w-lg mx-auto border-x">
      {/* 헤더 */}
      <header className="p-4 bg-white border-b flex justify-between items-center sticky top-0 z-10">
        <span className="font-bold text-green-600 text-lg">히요리</span>
      </header>

      {/* 메시지 리스트 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.is_from_user ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
              m.is_from_user ? 'bg-green-500 text-white rounded-tr-none' : 'bg-white text-gray-800 border rounded-tl-none shadow-sm'
            }`}>
              {m.image_url && <img src={m.image_url} className="rounded-lg mb-2 max-w-full" alt="sent" />}
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-xs text-gray-400 italic">히요리가 입력 중...</div>}
        <div ref={scrollRef} />
      </main>

      {/* 입력창 (iOS ChatInputView 재현) */}
      <footer className="p-4 bg-white border-t space-y-2">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <input 
            className="flex-1 bg-transparent outline-none text-sm"
            placeholder="문자 메시지"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          />
          <button onClick={() => handleSend(input)} disabled={!input}>
            <svg className={`w-8 h-8 ${input ? 'text-green-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
