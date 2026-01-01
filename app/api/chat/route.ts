import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // 엣지 런타임 응답
    return NextResponse.json({
      reply: `Echo from Edge: ${message} (Next.js 14.3.0)`
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
