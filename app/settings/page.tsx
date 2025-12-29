'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Camera, Image as ImageIcon, Clock, ChevronRight, Key } from 'lucide-react';
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
    let { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const { data: { user: newUser } } = await supabase.auth.signInAnonymously();
      user = newUser;
    }
    const { error } = await supabase.from('profiles').upsert({ id: user?.id, ...form });
    if (error) alert("저장 실패: " + error.message);
    else alert("설정 완료!");
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center bg-white border-b sticky top-0 z-10">
        <Link href="/" className="text-[#007AFF] flex items-center"><ChevronLeft /> 목록</Link>
        <span className="font-bold">설정</span>
        <button onClick={save} disabled={loading} className="text-[#007AFF] font-bold">
          {loading ? '...' : '완료'}
        </button>
      </header>

      <div className="p-4 space-y-6 overflow-y-auto">
        {/* 프로필 이미지 */}
        <div className="flex flex-col items-center py-4">
          <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden mb-2 shadow-inner flex items-center justify-center">
            {form.avatar_url ? <img src={form.avatar_url} className="w-full h-full object-cover" /> : <Camera className="text-white" />}
          </div>
          <button className="text-[#007AFF] text-sm">사진 수정</button>
        </div>

        {/* 핵심 메뉴 섹션 (이게 안 눌렸던 부분입니다) */}
        <div className="bg-white rounded-xl border border-gray-200 divide-y overflow-hidden">
          <Link href="/gallery" className="p-4 flex items-center justify-between active:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center text-white">
                <ImageIcon size={18} />
              </div>
              <span className="text-[16px]">사진첩 관리</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
          <Link href="/timeline" className="p-4 flex items-center justify-between active:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-green-500 rounded-md flex items-center justify-center text-white">
                <Clock size={18} />
              </div>
              <span className="text-[16px]">선톡(타임라인) 설정</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
        </div>

        {/* 이름 설정 섹션 */}
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

        {/* API 키 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Key size={16} />
            <span className="text-xs font-bold uppercase">OpenAI API KEY</span>
          </div>
          <input 
            type="password"
            className="w-full bg-gray-50 p-3 rounded-lg text-sm outline-none"
            value={form.openai_api_key}
            onChange={e => setForm({...form, openai_api_key: e.target.value})}
            placeholder="sk-..."
          />
        </div>
      </div>
    </div>
  );
}
