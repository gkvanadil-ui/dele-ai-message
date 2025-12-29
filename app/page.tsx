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

  // 사진 수정 클릭 시 파일 선택창 강제 호출 (이벤트 전파 보장)
  const handlePhotoEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = `${user?.id}/avatar_${Date.now()}.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
      
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      alert("사진이 임시 반영되었습니다. 완료를 눌러 저장하세요.");
    } catch (err: any) {
      alert("업로드 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').upsert({
      id: user?.id,
      ...profile,
      updated_at: new Date().toISOString()
    });
    
    if (error) alert("저장 실패: " + error.message);
    else {
      alert("설정이 저장되었습니다.");
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans text-black overflow-hidden">
      {/* 1. 헤더: 목록 가기 및 완료 버튼 (고정 UI) */}
      <header className="px-4 pt-12 pb-4 flex justify-between items-center bg-white border-b sticky top-0 z-[100]">
        <button onClick={() => router.push('/')} className="text-[#007AFF] flex items-center text-[17px] active:opacity-50">
          <ChevronLeft /> 목록
        </button>
        <span className="font-bold text-[17px]">설정</span>
        <button onClick={saveProfile} disabled={loading} className="text-[#007AFF] font-bold text-[17px] active:opacity-50">
          {loading ? '...' : '완료'}
        </button>
      </header>

      {/* 2. 본문 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 프로필 사진 수정 섹션: 클릭이 안 되는 문제를 해결하기 위해 최상단 z-index 부여 */}
        <div className="flex flex-col items-center py-6">
          <div 
            onClick={handlePhotoEditClick}
            className="w-24 h-24 rounded-full bg-[#E3E3E8] overflow-hidden mb-3 flex items-center justify-center cursor-pointer border border-gray-200 active:opacity-70 relative z-20"
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              <Camera size={40} className="text-white" />
            )}
          </div>
          <button 
            type="button"
            onClick={handlePhotoEditClick} 
            className="text-[#007AFF] text-[15px] font-medium active:opacity-50 relative z-20"
          >
            사진 수정
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleAvatarUpload} 
            accept="image/*" 
          />
        </div>

        {/* 이름 설정 섹션 (순정 레이아웃) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between bg-white">
            <span className="text-[15px] font-medium min-w-[80px]">내 이름</span>
            <input 
              className="text-right outline-none text-[15px] text-gray-500 bg-transparent flex-1"
              value={profile.user_name}
              onChange={(e) => setProfile({...profile, user_name: e.target.value})}
              placeholder="본인 이름"
            />
          </div>
          <div className="px-4 py-3 flex items-center justify-between bg-white">
            <span className="text-[15px] font-medium min-w-[80px]">상대 이름</span>
            <input 
              className="text-right outline-none text-[15px] text-gray-500 bg-transparent flex-1"
              value={profile.character_name}
              onChange={(e) => setProfile({...profile, character_name: e.target.value})}
              placeholder="캐릭터 이름"
            />
          </div>
        </div>

        {/* 페르소나 (프롬프트) 입력칸 복구: 삭제하지 말고 유지하는 1순위 조건 반영 */}
        <div className="space-y-2 px-1">
          <span className="text-[13px] text-gray-500 uppercase font-medium ml-3">페르소나 (프롬프트)</span>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <textarea 
              className="w-full h-48 outline-none text-[15px] text-black resize-none bg-transparent"
              value={profile.system_prompt}
              onChange={(e) => setProfile({...profile, system_prompt: e.target.value})}
              placeholder="AI 캐릭터의 말투와 성격을 여기에 적으세요."
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
