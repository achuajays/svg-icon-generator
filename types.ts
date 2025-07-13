
export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  image?: string | null;
}

export interface HistoryEntry {
  id: number;
  timestamp: string;
  code: string;
}
