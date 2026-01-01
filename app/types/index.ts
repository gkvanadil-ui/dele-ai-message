export interface User {
  id: string;
  email?: string;
  // 필요한 유저 필드 추가
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  user_id: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  history: Message[];
}

export interface ChatResponse {
  reply: string;
  error?: string;
}
