export interface Game {
  id: number;
  name: string;
  description: string;
  is_premium: boolean | number; // Laravel might return 0/1 or true/false
  rules?: string;
  created_at?: string;
}

export interface CreateGameData {
  name: string;
  description: string;
  rules: string;
  is_premium: boolean;
}
