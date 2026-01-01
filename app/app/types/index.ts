// app/types/index.ts

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  image_url?: string;
  created_at: string;
}

export interface Profile {
  character_name: string;
  user_name: string;
  system_prompt: string;
  avatar_url: string;
}

export interface ChatRequest {
  message: string;
  imageUrl?: string;
}

export interface ChatResponse {
  reply: string;
  generatedMessageId?: string;
}
