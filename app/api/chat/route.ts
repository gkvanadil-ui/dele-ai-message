// app/api/chat/route.ts

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { ChatRequest } from '../../types'; // 상대 경로 수정

// OpenAI 클라이언트 초기화
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Supabase Admin 클라이언트 (Service Role Key 사용 - DB 모든 권한 보유)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 텍스트 정제 함수
function cleanText(text: string): string {
  let cleaned = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  cleaned = cleaned.replace(/(ㅠㅠ|ㅜㅜ|ㅎㅎ|ㅋㅋ|^^|;;)/g, '');
  return cleaned.trim();
}

export async function POST(req: Request) {
  try {
    // 1. [보안] 헤더에서 Authorization Token 추출 및 검증
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    // 2. 요청 데이터 파싱
    const { message, imageUrl } = (await req.json()) as ChatRequest;

    // 3. [보안] 서버가 DB에서 직접 사용자 프로필(페르소나) 조회
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('character_name, user_name, system_prompt')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 4. OpenAI 메시지 구성
    const systemInstruction = `
      당신은 '${profile.character_name || 'Chatbot'}'입니다. 
      사용자('${profile.user_name || 'User'}')와 대화하고 있습니다.
      
      [절대 규칙]
      1. 이모티콘이나 이모지를 절대 사용하지 마세요.
      2. 사용자를 '${profile.user_name || 'User'}'라고 부르세요.
      3. 답변은 3문장 이내로 간결하게 하세요.
      
      [캐릭터 설정]
      ${profile.system_prompt || '친절하게 대답하세요.'}
    `;

    const messages: any[] = [{ role: 'system', content: systemInstruction }];

    let cleanInput = '';
    if (message) {
      cleanInput = cleanText(message);
      messages.push({ role: 'user', content: cleanInput });
    }

    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: '이 이미지를 보고 반응해줘.' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      });
    }

    // 5. OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', 
      messages: messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    const aiReplyRaw = completion.choices[0].message.content || '...';
    const aiReplyClean = cleanText(aiReplyRaw);

    // 6. [데이터 정합성] DB 저장
    const now = new Date().toISOString();
    
    // 6-1. 사용자 메시지 저장
    if (cleanInput || imageUrl) {
      await supabaseAdmin.from('messages').insert({
        user_id: user.id,
        content: cleanInput || '(사진 전송)',
        role: 'user',
        image_url: imageUrl,
        created_at: now
      });
    }

    // 6-2. AI 응답 저장
    const { data: savedAiMsg } = await supabaseAdmin
      .from('messages')
      .insert({
        user_id: user.id,
        content: aiReplyClean,
        role: 'assistant',
        created_at: new Date(Date.now() + 100).toISOString()
      })
      .select()
      .single();

    return NextResponse.json({ 
      reply: aiReplyClean,
      generatedMessageId: savedAiMsg?.id 
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
