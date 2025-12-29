'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, MoreHorizontal, SquarePen, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function MessageListPage() {
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
    };
    load();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '450px', margin: '0 auto', backgroundColor: 'white', color: 'black', overflow: 'hidden' }}>
      <header style={{ padding: '48px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white' }}>
        <button onClick={() => router.push('/settings')} style={{ color: '#007AFF', fontSize: '17px', background: 'none', border: 'none', cursor: 'pointer' }}>편집</button>
        <button style={{ width: '32px', height: '32px', backgroundColor: '#F2F2F7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: '#007AFF' }}>
          <MoreHorizontal size={20} />
        </button>
      </header>
      <div style={{ padding: '0 16px 16px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: 'bold', margin: '0 0 8px' }}>메시지</h1>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#E9E9EB', borderRadius: '10px', padding: '6px 10px' }}>
          <Search size={18} style={{ color: '#8E8E93', marginRight: '6px' }} />
          <input style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '17px', width: '100%' }} placeholder="검색" />
        </div>
      </div>
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div onClick={() => router.push('/chat')} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #F2F2F7', cursor: 'pointer' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#E5E7EB', overflow: 'hidden', flexShrink: 0 }}>
            {profile?.avatar_url && <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ marginLeft: '12px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{profile?.character_name || '대화 상대'}</span>
              <p style={{ color: '#8E8E93', fontSize: '14px', margin: 0 }}>새 메시지를 시작해보세요.</p>
            </div>
            <ChevronRight size={16} style={{ color: '#C7C7CC' }} />
          </div>
        </div>
      </main>
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: 0 }}>
        <button onClick={() => router.push('/chat')} style={{ width: '48px', height: '48px', backgroundColor: 'white', borderRadius: '50%', border: '1px solid #F2F2F7', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SquarePen size={24} />
        </button>
      </div>
    </div>
  );
}
