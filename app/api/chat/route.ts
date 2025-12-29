import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const { messages, userId } = await req.json();

  // 1. 유저 설정 및 API 키 가져오기
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile?.openai_api_key) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: profile.openai_api_key });

  // 2. 마지막 메시지 분석 (사진 요청 여부)
  const lastMessage = messages[messages.length - 1].content;
  const photoRequestKeywords = ['보여줘', '보여줄수', '보여줄 수', '찍어줘', '찍어서', '보내봐', '보내줘'];
  
  // 키워드가 포함되어 있는지 확인
  const isPhotoRequested = photoRequestKeywords.some(keyword => lastMessage.includes(keyword));

  // 3. OpenAI 답변 생성
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // 또는 gpt-4
    messages: [
      { role: "system", content: profile.system_prompt },
      ...messages
    ],
  });

  const aiContent = response.choices[0].message.content;
  let imageUrl = null;

  // 4. "보여줘" 계열의 워딩이 있고, 사진첩에 사진이 있다면 랜덤으로 하나 선택
  if (isPhotoRequested) {
    const { data: photos } = await supabase
      .from('character_photos')
      .select('photo_url')
      .eq('user_id', userId);

    if (photos && photos.length > 0) {
      const randomIndex = Math.floor(Math.random() * photos.length);
      imageUrl = photos[randomIndex].photo_url;
    }
  }

  // 5. 메시지 DB 저장 (텍스트 + 사진 URL)
  const { data: newMessage, error } = await supabase.from('messages').insert([
    {
      user_id: userId,
      content: aiContent,
      is_from_user: false,
      image_url: imageUrl // 사진이 선택되었다면 URL이 들어가고, 아니면 null
    }
  ]).select().single();

  return NextResponse.json(newMessage);
}
