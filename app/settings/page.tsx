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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    } catch (e) {
      console.error("데이터 로드 실패");
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('profiles').upsert({ 
        id: user?.id, 
        ...profile,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      alert("성공적으로 저장되었습니다.");
      router.replace('/'); // 목록으로 강제 이동
    } catch (err: any) {
      alert("저장 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans text-black relative">
      {/* 1. 상단 헤더: 뒤로가기(목록) 기능 보장 */}
      <header className="px-4 pt-12 pb-4 flex justify-between items-center bg-white border-b sticky top-0 z-[100]">
        <button 
          onClick={() => router.push('/')} 
          className="text-[#007AFF] flex items-center text-[17px] active:opacity-50"
        >
          <ChevronLeft /> 목록
        </button>
        <span className="font-bold text-[17px]">설정</span>
        <button 
          onClick={saveProfile} 
          disabled={loading} 
          className="text-[#007AFF] font-bold text-[17px] active:opacity-50"
        >
          {loading ? '...' : '완료'}
        </button>
      </header>

      {/* 2. 본문 영역 */}
      <div className="p-4 space-y-6">
        {/* 프로필 사진 수정: 클릭 시 갤러리 열림 */}
        <div className="flex flex-col items-center py-6">
          <div 
            onClick={() => fileInputRef.current?.click()} 
            className="w-24 h-24 rounded-full bg-[#E3E3E8] overflow-hidden mb-3 border border-gray-200 cursor-pointer active:opacity-70"
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              <Camera size={40} className="m-auto mt-6 text-white" />
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="text-[#007AFF] text-[15px] font-medium"
          >
            사진 수정
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
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
            accept="image/*" 
          />
        </div>

        {/* 이름 입력 섹션 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-[15px] font-medium">내 이름</span>
            <input 
              className="text-right outline-none text-[15px] text-gray-500 bg-transparent flex-1"
              value={profile.user_name}
              onChange={(e) => setProfile({...profile, user_name: e.target.value})}
              placeholder="본인 이름"
            />
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-[15px] font-medium">상대 이름</span>
            <input 
              className="text-right outline-none text-[15px] text-gray-500 bg-transparent flex-1"
              value={profile.character_name}
              onChange={(e) => setProfile({...profile, character_name: e.target.value})}
              placeholder="캐릭터 이름"
            />
          </div>
        </div>

        {/* 페르소나 (프롬프트) 입력칸: 복구 완료 */}
        <div className="space-y-2 px-1">
          <span className="text-[13px] text-gray-500 uppercase font-medium ml-3">페르소나 (프롬프트)</span>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <textarea 
              className="w-full h-48 outline-none text-[15px] text-black resize-none bg-transparent"
              value={profile.system_prompt}
              onChange={(e) => setProfile({...profile, system_prompt: e.target.value})}
              placeholder="캐릭터 성격과 말투를 적어주세요."
            />
          </div>
        </div>

        {/* API 키 섹션 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-2">
          <div className="text-[13px] text-gray-500 uppercase font-medium">OpenAI API Key</div>
          <input 
            type="password"
            className="w-full bg-[#F2F2F7] p-3 rounded-lg text-sm outline-none text-black"
            value={profile.openai_api_key}
            onChange={(e) => setProfile({...profile, openai_api_key: e.target.value})}
            placeholder="sk-..."
          />
        </div>
      </div>
    </div>
  );
}
