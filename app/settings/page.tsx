'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    character_name: '',
    user_name: '',
    system_prompt: '',
    avatar_url: '',
    openai_api_key: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data);
  };

  const handlePhotoEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const filePath = `${user?.id}/avatar_${Date.now()}`;
    await supabase.storage.from('photos').upload(filePath, file);
    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
    setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    alert("반영되었습니다. 상단 완료를 눌러주세요.");
    setLoading(false);
  };

  const saveProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').upsert({ id: user?.id, ...profile });
    alert("저장되었습니다.");
    router.push('/'); // 확실히 목록으로 이동
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans text-black">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center bg-white border-b sticky top-0 z-10">
        <button onClick={() => router.push('/')} className="text-[#007AFF] flex items-center text-[17px]">
          <ChevronLeft /> 목록
        </button>
        <span className="font-bold text-[17px]">설정</span>
        <button onClick={saveProfile} className="text-[#007AFF] font-bold text-[17px]">완료</button>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex flex-col items-center py-6">
          <div onClick={handlePhotoEditClick} className="w-24 h-24 rounded-full bg-[#E3E3E8] overflow-hidden mb-3 border border-gray-200 cursor-pointer">
            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <Camera className="m-auto mt-6 text-white" size={40} />}
          </div>
          <button onClick={handlePhotoEditClick} className="text-[#007AFF] text-[15px]">사진 수정</button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleAvatarUpload} accept="image/*" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border divide-y overflow-hidden">
          <div className="px-4 py-3 flex justify-between">
            <span>내 이름</span>
            <input className="text-right outline-none text-gray-500" value={profile.user_name} onChange={(e) => setProfile({...profile, user_name: e.target.value})} />
          </div>
          <div className="px-4 py-3 flex justify-between">
            <span>상대 이름</span>
            <input className="text-right outline-none text-gray-500" value={profile.character_name} onChange={(e) => setProfile({...profile, character_name: e.target.value})} />
          </div>
        </div>
        <div className="space-y-2">
          <span className="px-4 text-[13px] text-gray-500 uppercase">페르소나 (프롬프트)</span>
          <div className="bg-white rounded-xl border p-4">
            <textarea className="w-full h-48 outline-none text-[15px] resize-none" value={profile.system_prompt} onChange={(e) => setProfile({...profile, system_prompt: e.target.value})} placeholder="성격 입력..." />
          </div>
        </div>
      </div>
    </div>
  );
}
