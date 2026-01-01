import { NextResponse } from 'next/server';
import type { ChatRequest } from '../../types'; // 상대 경로 주의

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: '메시지가 없습니다.' }, { status: 400 });
    }

    // [TODO] 실제 AI 로직(OpenAI, Anthropic 등)을 여기에 연결하세요.
    // 현재는 예시로 에코 응답을 보냅니다.
    const mockReply = `AI 응답: "${message}"에 대한 처리가 완료되었습니다.`;

    // 서버 사이드에서 DB 저장이 필요하다면 여기서 수행하거나, 
    // 클라이언트가 받아서 저장하도록 할 수 있습니다. (현재 클라이언트 주도 저장 방식 채택)
    
    return NextResponse.json({ reply: mockReply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
