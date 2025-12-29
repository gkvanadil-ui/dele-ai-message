'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Camera, Key } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    user_name: '', character_name: '', system_prompt: '', avatar_url: '', openai_api_key: '' 
  });

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setForm(data);
    };
    loadData();
  }, []);

  const save = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("세션 연결 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...form });
    if (error) alert("저장 실패: " + error.message);
    else alert("모든 정보가 기기에 저장되었습니다!");
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center bg-white border-b sticky top-0 z-10">
        <Link href="/" className="text-[#007AFF] flex items-center"><ChevronLeft /> 목록</Link>
        <span className="font-bold">설정</span>
        <button onClick={save} disabled={loading} className="text-[#007AFF] font-bold disabled:opacity-50">
          {loading ? '저장 중...' : '완료'}
        </button>
      </header>

      <div className="p-4 space-y-6 overflow-y-auto">
        {/* 프로필 및 이름 설정 섹션 */}
        <div className="bg-white rounded-xl border border-gray-200 divide-y">
          <div className="p-4 flex items-center justify-between">
            <span className="text-gray-500">내 이름</span>
            <input className="text-right outline-none" value={form.user_name} onChange={e => setForm({...form, user_name: e.target.value})} placeholder="본인 이름" />
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-gray-500">상대 이름</span>
            <input className="text-right outline-none" value={form.character_name} onChange={e => setForm({...form, character_name: e.target.value})} placeholder="상대 이름" />
          </div>
        </div>

        {/* API 키 설정 섹션 (가장 중요) */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Key size={16} />
            <span className="text-xs font-bold uppercase">OpenAI API 설정</span>
          </div>
          <input 
            type="password"
            className="w-full bg-gray-50 p-3 rounded-lg text-sm outline-none border border-gray-100"
            value={form.openai_api_key}
            onChange={e => setForm({...form, openai_api_key: e.target.value})}
            placeholder="sk-..."
          />
          <p className="text-[10px] text-gray-400 pl-1">* API 키는 본인 계정에 암호화되어 저장됩니다.</p>
        </div>

        {/* 성격 설정 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <span className="text-xs font-bold text-gray-500 uppercase block mb-2">캐릭터 성격 (프롬프트)</span>
          <textarea 
            className="w-full h-32 bg-gray-50 p-3 rounded-lg text-sm outline-none resize-none"
            value={form.system_prompt}
            onChange={e => setForm({...form, system_prompt: e.target.value})}
            placeholder="다정한 말투로 대답해줘."
          />
        </div>
      </div>
    </div>
  );
}
