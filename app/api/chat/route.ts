import { NextResponse } from 'next/server';

// Cloudflare Pages를 위한 Edge Runtime 강제 설정
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    // TODO: 실제 AI 로직 연결
    const reply = `AI 응답 (Edge): "${message}" 내용을 확인했습니다.`;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
