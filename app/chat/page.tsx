'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    const tempId = crypto.randomUUID();
    
    // 유저 메시지 즉시 표시
    setMessages((prev) => [
      ...prev, 
      { id: tempId, role: 'user', content: text }
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const aiText = data.reply || '응답 오류';

      // AI 메시지 표시
      setMessages((prev) => [
        ...prev, 
        { id: crypto.randomUUID(), role: 'assistant', content: aiText }
      ]);
      
      // (선택) Supabase 저장 로직 추가 가능
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

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white border-x shadow-sm relative">
      {/* 헤더 */}
      <header className="p-4 border-b flex justify-between items-center bg-white z-20">
        <h1 className="font-bold text-gray-800">Dele Chat</h1>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">⋮</button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-30">
              <button 
                onClick={() => router.push('/')} 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                나가기
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap shadow-sm ${
              msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white border text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isSending && <div className="text-xs text-gray-500 p-2">입력 중...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input 
            className="flex-1 border rounded-full px-4 py-2" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            onKeyDown={handleKeyDown}
            disabled={isSending}
            placeholder="메시지 입력..."
          />
          <button 
            onClick={sendMessage} 
            disabled={isSending}
            className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
