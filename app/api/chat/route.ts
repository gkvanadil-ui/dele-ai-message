import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { userId, message, history } = await req.json();

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!profile?.openai_api_key) return NextResponse.json({ error: "API Key 미등록" }, { status: 400 });

  const openai = new OpenAI({ apiKey: profile.openai_api_key });

  const dynamicSystemPrompt = `
    당신의 이름은 '${profile.character_name}'입니다.
    당신은 대화 상대방을 '${profile.user_title}'(이)라고 부릅니다.
    말투 및 성격: ${profile.system_prompt}
    반드시 JSON 형식 {"m": "응답내용"}으로만 대답하세요.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: dynamicSystemPrompt },
      ...history,
      { role: "user", content: message }
    ],
    response_format: { type: "json_object" }
  });

  return NextResponse.json(JSON.parse(response.choices[0].message.content || '{"m":""}'));
}
