// src/types.ts
export type CardStatus = '' | 'flipped' | 'match' | 'mismatch';

export interface CardData {
  name: string;
  image: string;
  status: CardStatus;
}
