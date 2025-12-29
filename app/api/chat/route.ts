import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { message, history, imageUrl } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "당신은 '히요리'입니다. 반말로 다정하게 대답하세요. JSON {'m': '내용'}으로 응답하세요." },
      ...history,
      {
        role: "user",
        content: imageUrl 
          ? [{ type: "text", text: message }, { type: "image_url", image_url: { url: imageUrl } }]
          : message
      }
    ],
    response_format: { type: "json_object" }
  });

  return NextResponse.json(JSON.parse(response.choices[0].message.content!));
}
