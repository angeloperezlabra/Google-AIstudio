import { Achievement, PlayerStats, AssociatedWord } from '../types/achievements';
import { Sticker } from '../types/sticker';
import { sounds } from './audio';
import { fireAchievementConfetti } from './confetti';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_sticker',
    titleEs: 'Primer Cromo Adhesivo',
    titleZh: '初试身手 · 第一张贴纸',
    descriptionEs: 'Empareja tu primera palabra en español con su significado en chino.',
    descriptionZh: '成功匹配第一对西语与中文词汇。',
    icon: '🌟',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-300',
    unlocked: false,
    currentValue: 0,
    targetValue: 1,
    rewardPoints: 100,
  },
  {
    id: 'half_album',
    titleEs: 'Coleccionista Prometedor (50%)',
    titleZh: '半程荣耀 · 完成50%相册',
    descriptionEs: '¡Has pegado con éxito el 50% de las estampas de todo el álbum!',
    descriptionZh: '已成功收集并粘贴全集50%的西语贴纸！',
    icon: '🥉',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    unlocked: false,
    currentValue: 0,
    targetValue: 12, // dynamic
    rewardPoints: 500,
  },
  {
    id: 'full_album',
    titleEs: 'Maestro del Español (100%)',
    titleZh: '金牌圆满 · 100%相册全收集',
    descriptionEs: '¡Increíble! Has completado el 100% del álbum con todas sus estampas a color.',
    descriptionZh: '太棒了！已全部点亮所有西语贴纸，达成100%收集！',
    icon: '🏆',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-400',
    unlocked: false,
    currentValue: 0,
    targetValue: 24, // dynamic
    rewardPoints: 1000,
  },
  {
    id: 'streak_five',
    titleEs: 'Racha Imparable (x5)',
    titleZh: '连珠妙语 · 连对5题',
    descriptionEs: 'Consigue 5 emparejamientos correctos consecutivos sin cometer ningún error.',
    descriptionZh: '连续正确匹配5个词汇，未出现任何失误。',
    icon: '🔥',
    badgeColor: 'bg-orange-100 text-orange-700 border-orange-300',
    unlocked: false,
    currentValue: 0,
    targetValue: 5,
    rewardPoints: 250,
  },
  {
    id: 'page_complete',
    titleEs: 'Página Temática Sellada',
    titleZh: '主题盖章 · 完整单页',
    descriptionEs: 'Completa al 100% al menos una temática completa del álbum.',
    descriptionZh: '成功点亮某一个分类的所有贴纸。',
    icon: '🎖️',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-300',
    unlocked: false,
    currentValue: 0,
    targetValue: 1,
    rewardPoints: 300,
  },
  {
    id: 'audio_listener',
    titleEs: 'Oído Políglota',
    titleZh: '语感大师 · 聆听发音',
    descriptionEs: 'Escucha la pronunciación en audio de 5 palabras para perfeccionar tu acento.',
    descriptionZh: '主动收听5次西班牙语音频发音。',
    icon: '🎧',
    badgeColor: 'bg-sky-100 text-sky-700 border-sky-300',
    unlocked: false,
    currentValue: 0,
    targetValue: 5,
    rewardPoints: 150,
  },
  {
    id: 'multiplayer_star',
    titleEs: 'Compañero de Campus',
    titleZh: '校园协作 · 多人模式',
    descriptionEs: 'Participa en una partida multijugador (competitiva o colaborativa).',
    descriptionZh: '参与一次双人联机对战或合作模式。',
    icon: '👥',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    unlocked: false,
    currentValue: 0,
    targetValue: 1,
    rewardPoints: 200,
  }
];

export interface AchievementContext {
  lastPlacedSticker?: Sticker;
  recentStreakStickers?: Sticker[];
  completedPageStickers?: Sticker[];
  allPlacedStickers?: Sticker[];
}

export function checkAchievements(
  currentList: Achievement[],
  stats: PlayerStats,
  placedCount: number,
  totalStickers: number,
  completedPagesCount: number,
  context?: AchievementContext,
  onUnlock?: (achievement: Achievement) => void
): Achievement[] {
  const halfTarget = Math.max(1, Math.ceil(totalStickers * 0.5));
  const fullTarget = Math.max(1, totalStickers);

  let newlyUnlocked: Achievement | null = null;

  const toAssociatedWord = (s: Sticker): AssociatedWord => ({
    id: s.id,
    spanish: s.spanish,
    chinese: s.chinese,
    pinyin: s.pinyin,
    emoji: s.emoji,
    imageUrl: s.imageUrl,
  });

  const updated = currentList.map(item => {
    let currVal = item.currentValue;
    let target = item.targetValue;

    if (item.id === 'first_sticker') {
      currVal = placedCount;
      target = 1;
    } else if (item.id === 'half_album') {
      currVal = placedCount;
      target = halfTarget;
    } else if (item.id === 'full_album') {
      currVal = placedCount;
      target = fullTarget;
    } else if (item.id === 'streak_five') {
      currVal = Math.max(currVal, stats.maxStreak);
      target = 5;
    } else if (item.id === 'page_complete') {
      currVal = completedPagesCount;
      target = 1;
    } else if (item.id === 'audio_listener') {
      currVal = stats.audiosPlayed;
      target = 5;
    } else if (item.id === 'multiplayer_star') {
      currVal = stats.multiplayerGamesPlayed;
      target = 1;
    }

    const isUnlockedNow = !item.unlocked && currVal >= target;
    if (isUnlockedNow) {
      let words: AssociatedWord[] = [];
      let contextNote = '';

      if (item.id === 'first_sticker' && context?.lastPlacedSticker) {
        words = [toAssociatedWord(context.lastPlacedSticker)];
        contextNote = `Hito inaugurado con la palabra: "${context.lastPlacedSticker.spanish}" (${context.lastPlacedSticker.chinese})`;
      } else if (item.id === 'streak_five' && context?.recentStreakStickers && context.recentStreakStickers.length > 0) {
        words = context.recentStreakStickers.slice(-5).map(toAssociatedWord);
        contextNote = `Racha de 5 aciertos consecutivos completada con éxito.`;
      } else if (item.id === 'half_album') {
        const sample = (context?.allPlacedStickers || []).slice(0, 6);
        words = sample.map(toAssociatedWord);
        contextNote = `50% del álbum desbloqueado al colocar "${context?.lastPlacedSticker?.spanish || 'la estampa número ' + halfTarget}".`;
      } else if (item.id === 'full_album') {
        const sample = (context?.allPlacedStickers || []).slice(-6);
        words = sample.map(toAssociatedWord);
        contextNote = `¡100% de la colección completa! Última estampa: "${context?.lastPlacedSticker?.spanish || 'maestría alcanzada'}".`;
      } else if (item.id === 'page_complete' && context?.completedPageStickers) {
        words = context.completedPageStickers.map(toAssociatedWord);
        contextNote = `Página temática completada con todas sus estampas en orden.`;
      } else if (context?.lastPlacedSticker) {
        words = [toAssociatedWord(context.lastPlacedSticker)];
      }

      newlyUnlocked = {
        ...item,
        unlocked: true,
        unlockedAt: Date.now(),
        currentValue: currVal,
        targetValue: target,
        associatedWords: words,
        milestoneContext: contextNote,
      };
      return newlyUnlocked;
    }

    return {
      ...item,
      currentValue: currVal,
      targetValue: target,
    };
  });

  if (newlyUnlocked && onUnlock) {
    sounds.playPageCompleteSound();
    fireAchievementConfetti();
    onUnlock(newlyUnlocked);
  }

  return updated;
}
