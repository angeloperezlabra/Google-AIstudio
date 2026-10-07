export interface AssociatedWord {
  id: string;
  spanish: string;
  chinese: string;
  pinyin?: string;
  emoji: string;
  imageUrl?: string;
}

export interface Achievement {
  id: string;
  titleEs: string;
  titleZh: string;
  descriptionEs: string;
  descriptionZh: string;
  icon: string;
  badgeColor: string;
  unlocked: boolean;
  unlockedAt?: number;
  currentValue: number;
  targetValue: number;
  rewardPoints: number;
  associatedWords?: AssociatedWord[];
  milestoneContext?: string;
}

export interface PlayerStats {
  score: number;
  streak: number;
  maxStreak: number;
  correctCount: number;
  errorCount: number;
  audiosPlayed: number;
  pagesCompleted: number;
  multiplayerGamesPlayed: number;
}
