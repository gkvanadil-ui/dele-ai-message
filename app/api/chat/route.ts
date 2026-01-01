import { NextResponse } from 'next/server';

// Cloudflare Pages Edge Runtime 설정 (필수)
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    // [TODO] 실제 AI 로직 연결
    const reply = `AI 응답: "${message}" (Edge Runtime)`;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
