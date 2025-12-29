'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function Settings() {
  const [form, setForm] = useState({ character_name: '', user_title: '', openai_api_key: '', system_prompt: '' });

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').upsert({ id: user?.id, ...form });
    alert("저장되었습니다!");
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-6 bg-white min-h-screen">
      <div className="flex items-center gap-4">
        <Link href="/"><ChevronLeft /></Link>
        <h1 className="text-2xl font-bold">개인 설정</h1>
      </div>
      <div className="space-y-4">
        <div><label className="text-sm font-medium">상대방 이름</label><input className="w-full border-b py-2 outline-none" value={form.character_name} onChange={e => setForm({...form, character_name: e.target.value})} /></div>
        <div><label className="text-sm font-medium">나를 부르는 호칭</label><input className="w-full border-b py-2 outline-none" value={form.user_title} onChange={e => setForm({...form, user_title: e.target.value})} /></div>
        <div><label className="text-sm font-medium">OpenAI Key</label><input className="w-full border-b py-2 outline-none" type="password" value={form.openai_api_key} onChange={e => setForm({...form, openai_api_key: e.target.value})} /></div>
        <div><label className="text-sm font-medium">말투 설정</label><textarea className="w-full border rounded-lg p-3 h-32 mt-2" value={form.system_prompt} onChange={e => setForm({...form, system_prompt: e.target.value})} /></div>
        <button onClick={save} className="w-full bg-[#34C759] text-white p-4 rounded-xl font-bold text-lg mt-6 shadow-md">저장하기</button>
      </div>
    </div>
  );
}
