'use client';
import { useState, useEffect, useRef } from 'react';
import ChatBubble from '@/components/ChatBubble';
import ChatInput from '@/components/ChatInput';
import { supabase } from '@/lib/supabase';

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 메시지 불러오기 (SwiftData @Query 대체)
  useEffect(() => {
    const fetchMsgs = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMsgs();
  }, []);

  const handleSend = async (text: string, imgUrl?: string) => {
    // 유저 메시지 DB 저장 및 UI 반영
    const { data: newUserMsg } = await supabase.from('messages').insert({ content: text, image_url: imgUrl, is_from_user: true }).select().single();
    setMessages(prev => [...prev, newUserMsg]);

    // AI 응답 호출
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: text, history: [], imageUrl: imgUrl })
    });
    const aiData = await res.json();

    // AI 메시지 DB 저장
    const { data: newAiMsg } = await supabase.from('messages').insert({ content: aiData.m, is_from_user: false }).select().single();
    setMessages(prev => [...prev, newAiMsg]);
  };

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-[#f0f0f0]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => <ChatBubble key={m.id} message={m} />)}
        <div ref={scrollRef} />
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
}
