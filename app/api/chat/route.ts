import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // 관리자 권한 클라이언트

export async function POST(req: Request) {
  const { userId, message, history } = await req.json();

  // 1. 해당 유저의 개인 설정(API Key, Prompt) 가져오기
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('openai_api_key, system_prompt')
    .eq('id', userId)
    .single();

  if (!profile?.openai_api_key) {
    return NextResponse.json({ error: "API 키를 먼저 설정해주세요." }, { status: 400 });
  }

  // 2. 유저 개인 키로 OpenAI 초기화
  const openai = new OpenAI({ apiKey: profile.openai_api_key });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: profile.system_prompt },
      ...history,
      { role: "user", content: message }
    ],
    response_format: { type: "json_object" }
  });

  return NextResponse.json(JSON.parse(response.choices[0].message.content!));
}
