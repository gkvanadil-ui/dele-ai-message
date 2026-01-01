'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabase'; // utils 경로 주의
import type { Message, User } from '../types'; // types 경로 주의

// 안전한 UUID 생성 함수
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

  // 상태 관리
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 1. 초기화: 세션 체크 및 메시지 로드
  useEffect(() => {
    const initialize = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data?.user) {
          router.replace('/');
          return;
        }

        const currentUser: User = {
          id: data.user.id,
          email: data.user.email,
        };
        setUser(currentUser);

        // 이전 대화 내용 불러오기
        const { data: msgData } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: true });

        setMessages((msgData as Message[]) || []);
      } catch (e) {
        console.error('Init Error', e);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router]);

  // 2. 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // 3. 메시지 전송 로직
  const sendMessage = async () => {
    if (!inputText.trim() || isSending || !user) return;

    const text = inputText.trim();
    setInputText(''); // 입력창 초기화
    setIsSending(true);

    const tempId = createUUID();
    const now = new Date().toISOString();

    // UI 낙관적 업데이트 (사용자 메시지)
    const userMsg: Message = {
      id: tempId,
      role: 'user',
      content: text,
      user_id: user.id,
      created_at: now,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // DB 저장 (사용자)
      await supabase.from('messages').insert([{
        role: 'user', content: text, user_id: user.id
      }]);

      // AI API 호출
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error('API Error');

      const data = await res.json();
      const aiText = data.reply || '응답을 받을 수 없습니다.';

      // UI 업데이트 (AI 메시지)
      const aiMsg: Message = {
        id: createUUID(),
        role: 'assistant',
        content: aiText,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      
      // DB 저장 (AI)
      await supabase.from('messages').insert([{
        role: 'assistant', content: aiText, user_id: user.id
      }]);

    } catch (err) {
      console.error(err);
      alert('메시지 전송 중 오류가 발생했습니다.');
      // 에러 시 사용자 메시지 롤백 등 추가 처리 가능
    } finally {
      setIsSending(false);
    }
  };

  // 엔터키 처리
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // 한글 조합 중 중복 방지
    if (e.key === 'Enter') sendMessage();
  };

  // 로딩 화면
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white border-x shadow-sm relative">
      {/* 헤더 */}
      <header className="p-4 border-b flex justify-between items-center bg-white z-20">
        <h1 className="font-bold text-gray-800">Chat</h1>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            ⋮
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-30">
              <button 
                onClick={async () => { 
                  await supabase.auth.signOut(); 
                  router.push('/'); 
                }} 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 메시지 리스트 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap shadow-sm ${
              msg.role === 'user' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full animate-pulse">
              입력 중...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input 
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            onKeyDown={handleKeyDown}
            disabled={isSending}
            placeholder="메시지를 입력하세요..."
          />
          <button 
            onClick={sendMessage} 
            disabled={isSending || !inputText.trim()}
            className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-600 disabled:bg-blue-300"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
