import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    // [TODO] 여기에 실제 AI(OpenAI 등) 호출 로직 연결
    // 현재는 에코 응답을 반환합니다.
    const reply = `AI 응답: "${message}" 내용을 확인했습니다.`;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
