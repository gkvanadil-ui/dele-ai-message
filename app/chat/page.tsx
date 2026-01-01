// app/chat/page.tsx

'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Send, Image as ImageIcon, Phone, Video } from 'lucide-react';
import { supabase } from '../utils/supabase'; // 상대 경로 수정
import { Message, Profile } from '../types';   // 상대 경로 수정

export default function ChatPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // 1. 초기 데이터 로드 및 세션 체크
  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/'); return; }

      // 프로필 로드
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(profileData);

      // 메시지 내역 로드
      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });
        
      if (msgData) setMessages(msgData);
    };
    loadData();
  }, [router]);

  // 스크롤 자동 이동
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 2. 메시지 전송
  const sendMessage = async (text: string, imageUrl?: string) => {
    if ((!text.trim() && !imageUrl) || isLoading) return;
    
    // [UX] 낙관적 업데이트
    const tempId = self.crypto.randomUUID();
    const now = new Date().toISOString();
    
    const tempUserMessage: Message = {
      id: tempId,
      content: text,
      role: 'user',
      image_url: imageUrl,
      created_at: now
    };
    
    setMessages(prev => [...prev, tempUserMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ message: text, imageUrl }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      // AI 응답 추가
      if (data.reply) {
        const aiMessage: Message = {
          id: data.generatedMessageId || self.crypto.randomUUID(),
          content: data.reply,
          role: 'assistant',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      alert('메시지 전송에 실패했습니다.');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // 3. 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = await supabase.storage
        .from('chat-images')
        .createSignedUrl(fileName, 3600); 

      if (data?.signedUrl) {
        sendMessage('', data.signedUrl);
      }
    } catch (error) {
      console.error('Upload Error:', error);
      alert('이미지 업로드 실패');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '450px', margin: '0 auto', backgroundColor: 'white' }}>
      {/* Header */}
      <header style={{ 
        padding: '48px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'rgba(245, 245, 247, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #D1D1D6',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', color: '#007AFF', border: 'none', background: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={24} /> <span style={{fontSize: '17px'}}>목록</span>
        </button>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#8E8E93', overflow: 'hidden', marginBottom: '4px' }}>
            {profile?.avatar_url && <img src={profile.avatar_url} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{profile?.character_name || '상대방'}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', color: '#007AFF' }}>
          <Video size={24} />
          <Phone size={24} />
        </div>
      </header>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'white' }}>
        {messages.map((msg) => {
          const isMe = msg.role === 'user';
          return (
            <div key={msg.id} style={{ 
              alignSelf: isMe ? 'flex-end' : 'flex-start', 
              maxWidth: '75%',
              display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start'
            }}>
              {msg.image_url && (
                <img src={msg.image_url} alt="sent" style={{ borderRadius: '12px', marginBottom: '4px', maxWidth: '100%', border: '1px solid #E5E5EA' }} />
              )}
              {msg.content && msg.content !== '(사진 전송)' && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '18px',
                  backgroundColor: isMe ? '#007AFF' : '#E9E9EB',
                  color: isMe ? 'white' : 'black',
                  fontSize: '16px',
                  lineHeight: '1.4',
                  borderBottomRightRadius: isMe ? '4px' : '18px',
                  borderBottomLeftRadius: isMe ? '18px' : '4px',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
              )}
            </div>
          );
        })}
        {isTyping && (
           <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '18px', backgroundColor: '#E9E9EB', borderBottomLeftRadius: '4px' }}>
             <span style={{ color: '#8E8E93', fontSize: '14px' }}>입력 중...</span>
           </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '12px 16px 24px', backgroundColor: '#F2F2F7', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
        <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px', color: '#8E8E93', border: 'none', background: 'none', cursor: 'pointer' }}>
          <ImageIcon size={24} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleImageUpload}
        />
        
        <div style={{ 
          flex: 1, backgroundColor: 'white', borderRadius: '20px', padding: '8px 12px', 
          border: '1px solid #D1D1D6', display: 'flex', alignItems: 'center' 
        }}>
          <input 
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', maxHeight: '100px', backgroundColor: 'transparent' }}
            placeholder="iMessage"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
            disabled={isLoading}
          />
        </div>
        
        <button 
          onClick={() => sendMessage(inputText)} 
          disabled={!inputText.trim() || isLoading}
          style={{ 
            width: '32px', height: '32px', borderRadius: '50%', 
            backgroundColor: inputText.trim() ? '#007AFF' : '#8E8E93', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            border: 'none', color: 'white', transition: 'background-color 0.2s', cursor: 'pointer'
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
