
export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  image?: string | null;
}
