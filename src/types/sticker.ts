export type WordCategory = 'sustantivo' | 'verbo' | 'adjetivo' | 'expresion';
export type Gender = 'masculino' | 'femenino' | 'neutro' | 'ninguno';

export interface Sticker {
  id: string;
  pageId: string;
  slotNumber: number;
  // Spanish
  spanish: string;
  article?: string; // "el", "la", "un", "una"
  category: WordCategory;
  gender: Gender;
  exampleEs: string;
  
  // Chinese
  chinese: string;
  pinyin: string;
  exampleZh: string;

  // Visual
  imageUrl: string;
  emoji: string;
  bgGradient: string;
  badge?: string; // e.g. "¡Popular!", "A1", "A2"
}

export interface AlbumPage {
  id: string;
  titleEs: string;
  titleZh: string;
  descriptionEs: string;
  descriptionZh: string;
  icon: string;
  themeColor: string;
  stickers: Sticker[];
}

export type PlayMode = 'all_deck' | 'booster_packs';
