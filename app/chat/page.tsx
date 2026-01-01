'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabase';
import type { Message, User } from '../types';

// 안전한 UUID 생성
const createUUID = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          router.replace('/');
          return;
        }

        setUser({ id: data.user.id, email: data.user.email });

        const { data: msgData } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: true });

        setMessages((msgData as Message[]) || []);
      } catch (e) {
        // Error handling
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const sendMessage = async () => {
    if (!inputText.trim() || isSending || !user) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);
    const tempId = createUUID();

    const userMsg: Message = {
      id: tempId,
      role: 'user',
      content: text,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      await supabase.from('messages').insert([{
        role: 'user', content: text, user_id: user.id
      }]);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const aiText = data.reply || '응답 오류';

      const aiMsg: Message = {
        id: createUUID(),
        role: 'assistant',
        content: aiText,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      
      await supabase.from('messages').insert([{
        role: 'assistant', content: aiText, user_id: user.id
      }]);

    } catch (err) {
      alert('전송 실패');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') sendMessage();
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white border-x shadow-sm relative">
      <header className="p-4 border-b flex justify-between items-center bg-white z-20">
        <h1 className="font-bold text-gray-800">Chat (Cloudflare)</h1>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">⋮</button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-30">
              <button 
                onClick={() => { supabase.auth.signOut(); router.push('/'); }} 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white border text-gray-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isSending && <div className="text-xs text-gray-500 p-2">입력 중...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input 
            className="flex-1 border rounded-full px-4 py-2" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            onKeyDown={handleKeyDown}
            placeholder="메시지 입력..."
          />
          <button onClick={sendMessage} className="bg-blue-500 text-white rounded-full w-10 h-10">➤</button>
        </div>
      </div>
    </div>
  );
}
