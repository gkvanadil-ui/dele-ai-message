'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function Settings() {
  const [form, setForm] = useState({ character_name: '', user_title: '', openai_api_key: '', system_prompt: '' });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setForm(data);
      }
    };
    load();
  }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').upsert({ id: user?.id, ...form });
    alert("설정이 저장되었습니다! 이제 대화를 시작해보세요.");
  };

  return (
    <div className="p-6 max-w-md mx-auto min-h-screen bg-white shadow-lg">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/"><ChevronLeft className="text-gray-400" /></Link>
        <h1 className="text-2xl font-black text-gray-800">개인화 설정</h1>
      </div>
      
      <div className="space-y-6">
        <section className="space-y-4">
          <div className="group">
            <label className="text-xs font-bold text-green-600 uppercase tracking-wider">상대방 캐릭터 이름</label>
            <input className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-green-500 transition-colors text-lg" 
              placeholder="예: 토모에 히요리" value={form.character_name} onChange={e => setForm({...form, character_name: e.target.value})} />
          </div>
          <div className="group">
            <label className="text-xs font-bold text-green-600 uppercase tracking-wider">나를 부르는 호칭</label>
            <input className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-green-500 transition-colors text-lg" 
              placeholder="예: 주인님, 아기 고양이" value={form.user_title} onChange={e => setForm({...form, user_title: e.target.value})} />
          </div>
          <div className="group">
            <label className="text-xs font-bold text-green-600 uppercase tracking-wider">OpenAI API Key</label>
            <input className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-green-500 transition-colors text-sm" 
              type="password" placeholder="sk-..." value={form.openai_api_key} onChange={e => setForm({...form, openai_api_key: e.target.value})} />
          </div>
          <div className="group">
            <label className="text-xs font-bold text-green-600 uppercase tracking-wider">말투 및 성격 (프롬프트)</label>
            <textarea className="w-full border-2 border-gray-50 rounded-2xl p-4 h-40 mt-2 text-sm bg-gray-50 outline-none focus:bg-white focus:border-green-500 transition-all" 
              placeholder="캐릭터의 말투와 특징을 자세히 적어주세요." value={form.system_prompt} onChange={e => setForm({...form, system_prompt: e.target.value})} />
          </div>
        </section>

        <button onClick={save} className="w-full bg-black text-white p-5 rounded-2xl font-bold text-lg mt-4 flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 transition-all shadow-xl">
          <Save size={20} /> 설정 저장하기
        </button>
      </div>
    </div>
  );
}
