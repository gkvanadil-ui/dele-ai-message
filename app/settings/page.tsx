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
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans text-black relative">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center bg-white border-b sticky top-0 z-10">
        <button onClick={() => router.push('/')} className="text-[#007AFF] flex items-center text-[17px]"><ChevronLeft size={20} /> 목록</button>
        <span className="font-bold text-[17px]">설정</span>
        <button onClick={save} className="text-[#007AFF] font-bold text-[17px]">완료</button>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex flex-col items-center py-6">
          <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full bg-[#E3E3E8] overflow-hidden mb-3 border border-gray-200 flex items-center justify-center cursor-pointer">
            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <Camera size={40} className="text-white" />}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="text-[#007AFF] text-[15px]">사진 수정</button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const { data: { user } } = await supabase.auth.getUser();
            const { data: up } = await supabase.storage.from('photos').upload(`${user?.id}/${Date.now()}`, file);
            if (up) {
              const { data: url } = supabase.storage.from('photos').getPublicUrl(up.path);
              setProfile({...profile, avatar_url: url.publicUrl});
            }
          }} accept="image/*" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y overflow-hidden">
          <div className="px-4 py-3 flex justify-between items-center text-black">
            <span>내 이름</span>
            <input className="text-right outline-none text-gray-500 bg-transparent" value={profile.user_name} onChange={(e) => setProfile({...profile, user_name: e.target.value})} />
          </div>
          <div className="px-4 py-3 flex justify-between items-center text-black">
            <span>상대 이름</span>
            <input className="text-right outline-none text-gray-500 bg-transparent" value={profile.character_name} onChange={(e) => setProfile({...profile, character_name: e.target.value})} />
          </div>
        </div>
        <div className="space-y-2 px-1 text-black">
          <span className="text-[13px] text-gray-500 uppercase ml-3">페르소나 (프롬프트)</span>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <textarea className="w-full h-48 outline-none text-[15px] resize-none bg-transparent" value={profile.system_prompt} onChange={(e) => setProfile({...profile, system_prompt: e.target.value})} placeholder="말투 적기..." />
          </div>
        </div>
      </div>
    </div>
  );
}
