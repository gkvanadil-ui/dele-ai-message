'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Plus, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function GalleryPage() {
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    const loadPhotos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('character_photos').select('*').eq('user_id', user?.id);
      if (data) setPhotos(data);
    };
    loadPhotos();
  }, []);

  const uploadPhoto = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const { data: { user } } = await supabase.auth.getUser();
    const filePath = `photos/${user?.id}/${Date.now()}`;
    await supabase.storage.from('avatars').upload(filePath, file);
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    await supabase.from('character_photos').insert([{ user_id: user?.id, photo_url: publicUrl }]);
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center border-b bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <Link href="/" className="text-[#007AFF] flex items-center"><ChevronLeft /> 목록</Link>
        <span className="font-bold text-[17px]">사진첩</span>
        <label className="cursor-pointer text-[#007AFF]"><Plus size={24} /><input type="file" className="hidden" onChange={uploadPhoto} /></label>
      </header>

      <div className="grid grid-cols-3 gap-1 p-1 overflow-y-auto">
        {photos.map((p) => (
          <div key={p.id} className="aspect-square bg-gray-100 relative overflow-hidden">
            <img src={p.photo_url} className="w-full h-full object-cover" />
          </div>
        ))}
        {photos.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center pt-20 text-gray-400">
            <ImageIcon size={48} strokeWidth={1} />
            <p className="mt-2 text-sm">등록된 사진이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
