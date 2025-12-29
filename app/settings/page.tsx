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
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ 
    character_name: '', user_name: '', system_prompt: '', avatar_url: '' 
  });

  useEffect(() => {
    const loadProfile = async () => {
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
    loadProfile();
  }, []);

  const saveProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').upsert({ 
      id: user?.id, 
      ...profile,
      updated_at: new Date().toISOString()
    });
    alert("저장되었습니다.");
    router.push('/'); 
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans text-black overflow-hidden relative shadow-lg">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center bg-white border-b sticky top-0 z-[60]">
        <button onClick={() => router.push('/')} className="text-[#007AFF] flex items-center text-[17px] active:opacity-50">
          <ChevronLeft size={20} /> 목록
        </button>
        <span className="font-bold text-[17px]">설정</span>
        <button onClick={saveProfile} disabled={loading} className="text-[#007AFF] font-bold text-[17px] active:opacity-50">
          {loading ? '...' : '완료'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex flex-col items-center py-6">
          <div 
            onClick={() => fileInputRef.current?.click()} 
            className="w-24 h-24 rounded-full bg-[#E3E3E8] overflow-hidden mb-3 border border-gray-200 flex items-center justify-center cursor-pointer active:opacity-70"
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              <Camera size={40} className="text-white" />
            )}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="text-[#007AFF] text-[15px] font-medium">사진 수정</button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setLoading(true);
              const { data: { user } } = await supabase.auth.getUser();
              const filePath = `${user?.id}/avatar_${Date.now()}`;
              await supabase.storage.from('photos').upload(filePath, file);
              const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
              setProfile({...profile, avatar_url: publicUrl});
              setLoading(false);
            }} 
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y overflow-hidden">
          <div className="px-4 py-3 flex justify-between items-center text-black">
            <span className="text-[15px] font-medium">내 이름</span>
            <input 
              className="text-right outline-none text-[15px] text-gray-500 bg-transparent flex-1" 
              value={profile.user_name} 
              onChange={(e) => setProfile({...profile, user_name: e.target.value})} 
            />
          </div>
          <div className="px-4 py-3 flex justify-between items-center text-black">
            <span className="text-[15px] font-medium">상대 이름</span>
            <input 
              className="text-right outline-none text-[15px] text-gray-500 bg-transparent flex-1" 
              value={profile.character_name} 
              onChange={(e) => setProfile({...profile, character_name: e.target.value})} 
            />
          </div>
        </div>

        <div className="space-y-2 px-1 text-black">
          <span className="text-[13px] text-gray-500 uppercase font-medium ml-3">페르소나 (프롬프트)</span>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <textarea 
              className="w-full h-48 outline-none text-[15px] text-black resize-none bg-transparent" 
              value={profile.system_prompt} 
              onChange={(e) => setProfile({...profile, system_prompt: e.target.value})} 
              placeholder="AI 캐릭터의 말투와 성격을 적어주세요." 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
