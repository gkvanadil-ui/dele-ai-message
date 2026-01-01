export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  user_id: string;
  created_at: string;
}

export interface User {
  id: string;
  email?: string;
}
