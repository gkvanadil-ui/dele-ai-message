import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

export async function GET() {
  const { data: users } = await supabase.from('profiles').select('*').eq('is_notification_enabled', true);
  if (!users) return NextResponse.json({ m: "No active users" });

  for (const user of users) {
    if (Math.random() > 0.5) {
      try {
        const openai = new OpenAI({ apiKey: user.openai_api_key });
        const res = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: `이름:${user.character_name}, 호칭:${user.user_title}. ${user.system_prompt}` }, { role: "user", content: "선톡 보내줘" }],
          response_format: { type: "json_object" }
        });
        const aiRes = JSON.parse(res.choices[0].message.content || '{"m":""}');
        await supabase.from('messages').insert({ user_id: user.id, content: aiRes.m, is_from_user: false });
      } catch (e) { console.error(e); }
    }
  }
  return NextResponse.json({ ok: true });
}
