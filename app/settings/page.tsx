'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [form, setForm] = useState({ user_name: '', character_name: '', system_prompt: '', avatar_url: '', openai_api_key: '' });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setForm(data);
    };
    load();
  }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').upsert({ id: user?.id, ...form });
    alert("설정 완료!");
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center bg-white border-b">
        <Link href="/" className="text-[#007AFF] flex items-center"><ChevronLeft /> 목록</Link>
        <span className="font-bold">프로필 설정</span>
        <button onClick={save} className="text-[#007AFF] font-bold">완료</button>
      </header>

      <div className="mt-8 flex flex-col items-center px-4 space-y-6">
        <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden border-2 border-white shadow-md">
          {form.avatar_url ? <img src={form.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">사진</div>}
        </div>
        
        <div className="w-full bg-white rounded-xl border">
          <div className="p-4 border-b flex items-center"><span className="w-24 text-sm text-gray-500">내 이름</span><input className="flex-1 outline-none" value={form.user_name} onChange={e => setForm({...form, user_name: e.target.value})} /></div>
          <div className="p-4 border-b flex items-center"><span className="w-24 text-sm text-gray-500">캐릭터 이름</span><input className="flex-1 outline-none" value={form.character_name} onChange={e => setForm({...form, character_name: e.target.value})} /></div>
          <div className="p-4 border-b flex items-center"><span className="w-24 text-sm text-gray-500">프사 URL</span><input className="flex-1 outline-none text-xs" value={form.avatar_url} onChange={e => setForm({...form, avatar_url: e.target.value})} /></div>
          <div className="p-4 flex flex-col"><span className="text-sm text-gray-500 mb-2">캐릭터 프롬프트</span><textarea className="w-full h-32 outline-none bg-gray-50 p-2 rounded text-sm" value={form.system_prompt} onChange={e => setForm({...form, system_prompt: e.target.value})} /></div>
        </div>
        <div className="w-full bg-white rounded-xl p-4 border"><span className="text-xs text-gray-400 block mb-2">OpenAI KEY</span><input type="password" className="w-full outline-none text-sm" value={form.openai_api_key} onChange={e => setForm({...form, openai_api_key: e.target.value})} /></div>
      </div>
    </div>
  );
}
