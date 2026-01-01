'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabase';
import type { Message, User } from '../types';

// UUID 생성 (브라우저/서버 호환)
const generateUUID = () => {
  if (
    typeof window !== 'undefined' &&
    typeof window.crypto !== 'undefined' &&
    typeof window.crypto.randomUUID === 'function'
  ) {
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
  
  // any 제거 -> 명시적 타입 사용
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data, error: authError } = await supabase.auth.getUser();

        if (authError || !data?.user) {
          router.replace('/');
          return;
        }

        // Supabase User 타입을 우리가 정의한 User 타입으로 매핑 (id 필수)
        const currentUser: User = {
          id: data.user.id,
          email: data.user.email
        };
        setUser(currentUser);

        const { data: msgData, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: true });

        if (msgError) throw msgError;

        setMessages(msgData || []);

      } catch (error) {
        // 빌드 중 no-console 에러 방지를 위해 필요시 주석 처리 가능하나, error는 허용되는 편
        console.error('Init Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending || !user) return;

    const currentText = inputText.trim();
    setInputText('');
    setIsSending(true);

    const tempId = generateUUID();
    const now = new Date().toISOString();

    const userMsg: Message = {
      id: tempId,
      role: 'user',
      content: currentText,
      user_id: user.id,
      created_at: now,
    };
    
    setMessages((prev) => [...prev, userMsg]);

    try {
      const { error: insertError } = await supabase
        .from('messages')
        .insert([{
          role: 'user',
          content: currentText,
          user_id: user.id,
        }]);
      
      if (insertError) throw new Error('DB Save Failed');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentText, history: messages }),
      });

      if (!response.ok) throw new Error('API Failed');
      
      const data = await response.json();
      const aiContent = data.reply;

      const aiMsg: Message = {
        id: generateUUID(),
        role: 'assistant',
        content: aiContent,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, aiMsg]);

      await supabase.from('messages').insert([{
        role: 'assistant',
        content: aiContent,
        user_id: user.id,
      }]);

    } catch (error) {
      console.error('Send Error:', error);
      // alert는 빌드 에러를 유발하지 않음
      alert('전송 중 오류가 발생했습니다.');
      setMessages((prev) => prev.filter(msg => msg.id !== tempId));
      setInputText(currentText);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white border-x border-gray-200 shadow-sm relative">
      <header className="p-4 border-b flex justify-between items-center bg-white z-20">
        <h1 className="text-lg font-bold text-gray-800">Chat</h1>
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/');
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap ${
                  isUser
                    ? 'bg-blue-500 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded-full animate-pulse">
              입력 중...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white z-20">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100"
            placeholder="메시지 입력..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            autoComplete="off"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !inputText.trim()}
            className="bg-blue-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
