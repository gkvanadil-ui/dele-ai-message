'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({ character_name: '', user_name: '', system_prompt: '', avatar_url: '' });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile({
        character_name: data.character_name || '',
        user_name: data.user_name || '',
        system_prompt: data.system_prompt || '',
        avatar_url: data.avatar_url || ''
      });
    };
    load();
  }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').upsert({ id: user?.id, ...profile, updated_at: new Date().toISOString() });
    alert("저장되었습니다.");
    router.push('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '450px', margin: '0 auto', backgroundColor: '#F2F2F7', color: 'black', overflow: 'hidden' }}>
      <header style={{ padding: '48px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderBottom: '1px solid #D1D1D6' }}>
        <button onClick={() => router.push('/')} style={{ color: '#007AFF', display: 'flex', alignItems: 'center', fontSize: '17px', background: 'none', border: 'none' }}>
          <ChevronLeft size={20} /> 목록
        </button>
        <span style={{ fontWeight: 'bold', fontSize: '17px' }}>설정</span>
        <button onClick={save} style={{ color: '#007AFF', fontWeight: 'bold', fontSize: '17px', background: 'none', border: 'none' }}>완료</button>
      </header>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div onClick={() => fileInputRef.current?.click()} style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#E3E3E8', margin: '0 auto 12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {profile.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={40} style={{ color: 'white' }} />}
          </div>
          <button onClick={() => fileInputRef.current?.click()} style={{ color: '#007AFF', fontSize: '15px', background: 'none', border: 'none' }}>사진 수정</button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={async (e) => {
             const file = e.target.files?.[0];
             if (!file) return;
             const { data: { user } } = await supabase.auth.getUser();
             const { data: up } = await supabase.storage.from('photos').upload(`${user?.id}/${Date.now()}`, file);
             if (up) {
               const { data: url } = supabase.storage.from('photos').getPublicUrl(up.path);
               setProfile({...profile, avatar_url: url.publicUrl});
             }
          }} />
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', border: '1px solid #D1D1D6' }}>
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #D1D1D6' }}>
            <span>내 이름</span>
            <input style={{ textAlign: 'right', border: 'none', outline: 'none', color: '#8E8E93' }} value={profile.user_name} onChange={e => setProfile({...profile, user_name: e.target.value})} />
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
            <span>상대 이름</span>
            <input style={{ textAlign: 'right', border: 'none', outline: 'none', color: '#8E8E93' }} value={profile.character_name} onChange={e => setProfile({...profile, character_name: e.target.value})} />
          </div>
        </div>
        <div style={{ marginTop: '24px' }}>
          <span style={{ fontSize: '13px', color: '#8E8E93', textTransform: 'uppercase', marginLeft: '12px' }}>페르소나 (프롬프트)</span>
          <textarea style={{ width: '100%', height: '180px', backgroundColor: 'white', borderRadius: '10px', padding: '16px', border: '1px solid #D1D1D6', marginTop: '8px', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} value={profile.system_prompt} onChange={e => setProfile({...profile, system_prompt: e.target.value})} placeholder="성격을 적어주세요." />
        </div>
      </div>
    </div>
  );
}
