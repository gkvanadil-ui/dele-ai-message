import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { userId, message, history } = await req.json();

  // 사용자별 프로필(말투, 이름 등) 가져오기
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  
  if (!profile?.openai_api_key) return NextResponse.json({ error: "API Key missing" }, { status: 400 });

  const openai = new OpenAI({ apiKey: profile.openai_api_key });

  // 이전 대화 내용을 포함하여 기억력 유지
  const messages = [
    { role: "system", content: `이름:${profile.character_name}, 상대방:${profile.user_name}. 말투:${profile.system_prompt}. 반드시 JSON {"m": "응답내용"} 형식으로 답해.` },
    ...history.map((h: any) => ({ role: h.is_from_user ? "user" : "assistant", content: h.content })),
    { role: "user", content: message }
  ];

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages as any,
    response_format: { type: "json_object" }
  });

  const aiContent = JSON.parse(res.choices[0].message.content || '{"m":""}');
  return NextResponse.json(aiContent);
}
