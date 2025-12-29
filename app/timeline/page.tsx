'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Save, Bell, BellOff } from 'lucide-react';
import Link from 'next/link';

export default function TimelinePage() {
  const [time, setTime] = useState("08:00");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('timeline_settings').select('*').eq('id', user.id).single();
      if (data) {
        setTime(data.suntok_time.substring(0, 5));
        setEnabled(data.is_enabled);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('timeline_settings').upsert({
      id: user?.id,
      user_id: user?.id,
      suntok_time: time,
      is_enabled: enabled,
      updated_at: new Date().toISOString()
    });
    if (error) alert("저장 실패: " + error.message);
    else alert("선톡 설정이 완료되었습니다!");
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center border-b bg-white sticky top-0 z-10">
        <Link href="/" className="text-[#007AFF] flex items-center"><ChevronLeft /> 목록</Link>
        <span className="font-bold text-[17px]">선톡 설정</span>
        <button onClick={saveSettings} className="text-[#007AFF] font-bold">{loading ? '...' : '완료'}</button>
      </header>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            {enabled ? <Bell size={32} /> : <BellOff size={32} />}
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg text-black">선톡 활성화</h3>
            <p className="text-sm text-gray-500">정해진 시간에 캐릭터가 먼저 말을 겁니다.</p>
          </div>
          <button 
            onClick={() => setEnabled(!enabled)}
            className={`px-8 py-2 rounded-full font-bold transition-colors ${enabled ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            {enabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <span className="text-sm font-bold text-gray-500 block mb-4">알림 시간 설정</span>
          <input 
            type="time" 
            className="w-full text-4xl font-bold text-center bg-transparent outline-none text-black"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
