import { NextResponse } from 'next/server';
import type { ChatRequest } from '../../types';

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: '메시지가 없습니다.' }, { status: 400 });
    }

    // [TODO] 실제 AI 모델 연결. 현재는 에코 응답.
    const mockReply = `AI 응답: "${message}"`;

    return NextResponse.json({ reply: mockReply });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
