import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initialPages, STORAGE_KEY_PLACED, STORAGE_KEY_CUSTOM_PAGES } from './data/initialStickers';
import { AlbumPage, Sticker } from './types/sticker';
import { Achievement, PlayerStats } from './types/achievements';
import { INITIAL_ACHIEVEMENTS, checkAchievements, AchievementContext } from './utils/achievementsManager';
import { sounds, speakSpanish } from './utils/audio';
import { fireStickerConfetti, fireWinConfetti } from './utils/confetti';
import { useMultiplayer } from './hooks/useMultiplayer';
import { Header } from './components/Header';
import { AlbumBook } from './components/AlbumBook';
import { StickerDeck } from './components/StickerDeck';
import { AchievementsModal } from './components/AchievementsModal';
import { StickerDetailModal } from './components/StickerDetailModal';
import { BoosterPackModal } from './components/BoosterPackModal';
import { TeacherEditorModal } from './components/TeacherEditorModal';
import { MultiplayerView } from './components/MultiplayerView';
import { Sparkles, Trophy, CheckCircle, AlertCircle, Award } from 'lucide-react';

export default function App() {
  // --- Pages & Vocabulary ---
  const [pages, setPages] = useState<AlbumPage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_PAGES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialPages;
  });

  // --- Placed stickers ---
  const [placedStickerIds, setPlacedStickerIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLACED);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // --- Score & Stats ---
  const [score, setScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cromo_espanol_score');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [streak, setStreak] = useState<number>(0);

  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem('cromo_espanol_stats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      score: 0,
      streak: 0,
      maxStreak: 0,
      correctCount: 0,
      errorCount: 0,
      audiosPlayed: 0,
      pagesCompleted: 0,
      multiplayerGamesPlayed: 0,
    };
  });

  // --- Achievements ---
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem('cromo_espanol_achievements');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ACHIEVEMENTS;
  });

  const [recentStreakStickers, setRecentStreakStickers] = useState<Sticker[]>([]);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);

  // --- Settings & UI state ---
  const [showPinyin, setShowPinyin] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'album' | 'multiplayer' | 'achievements'>('album');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [detailSticker, setDetailSticker] = useState<Sticker | null>(null);
  const [mismatchedStickerId, setMismatchedStickerId] = useState<string | null>(null);
  const [filterCurrentPageOnly, setFilterCurrentPageOnly] = useState<boolean>(false);

  // --- Modals ---
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isBoosterOpen, setIsBoosterOpen] = useState<boolean>(false);
  const [isTeacherOpen, setIsTeacherOpen] = useState<boolean>(false);

  // --- Solo Timer ---
  const [soloTimerSeconds, setSoloTimerSeconds] = useState<number>(0);

  // --- Multiplayer Hook ---
  const {
    isInRoom,
    playerId,
    room,
    reactions,
    joinRoom,
    startGame,
    placeStickerMultiplayer,
    sendReaction,
    resetGame,
    leaveRoom,
  } = useMultiplayer();

  // All stickers flattened
  const allStickers = useMemo(() => {
    return pages.flatMap(p => p.stickers);
  }, [pages]);

  // Combined placed stickers (in collaborative mode, merge shared placements)
  const effectivePlacedIds = useMemo(() => {
    if (room && room.mode === 'collaborative' && room.sharedPlacements) {
      const sharedKeys = Object.keys(room.sharedPlacements);
      const set = new Set([...placedStickerIds, ...sharedKeys]);
      return Array.from(set);
    }
    return placedStickerIds;
  }, [placedStickerIds, room]);

  // Stickers still unplaced
  const unplacedStickers = useMemo(() => {
    const currentPage = pages[currentPageIndex];
    let list = allStickers.filter(s => !effectivePlacedIds.includes(s.id));
    if (filterCurrentPageOnly && currentPage) {
      list = list.filter(s => s.pageId === currentPage.id);
    }
    return list;
  }, [allStickers, effectivePlacedIds, filterCurrentPageOnly, pages, currentPageIndex]);

  // Completed pages count
  const completedPagesCount = useMemo(() => {
    return pages.filter(p => {
      if (p.stickers.length === 0) return false;
      return p.stickers.every(s => effectivePlacedIds.includes(s.id));
    }).length;
  }, [pages, effectivePlacedIds]);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLACED, JSON.stringify(placedStickerIds));
      localStorage.setItem('cromo_espanol_score', score.toString());
      localStorage.setItem('cromo_espanol_stats', JSON.stringify(stats));
      localStorage.setItem('cromo_espanol_achievements', JSON.stringify(achievements));
      localStorage.setItem(STORAGE_KEY_CUSTOM_PAGES, JSON.stringify(pages));
    } catch {}
  }, [placedStickerIds, score, stats, achievements, pages]);

  // Solo timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSoloTimerSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check achievements on progress changes
  const evaluateAchievements = useCallback((
    currentStats: PlayerStats,
    placedCount: number,
    context?: AchievementContext
  ) => {
    setAchievements(prev => {
      return checkAchievements(
        prev,
        currentStats,
        placedCount,
        allStickers.length,
        completedPagesCount,
        context,
        (unlocked) => {
          setAchievementToast(unlocked);
          setScore(s => s + unlocked.rewardPoints);
          setTimeout(() => setAchievementToast(null), 5000);
        }
      );
    });
  }, [allStickers.length, completedPagesCount]);

  // Check when effective placed changes
  useEffect(() => {
    evaluateAchievements(stats, effectivePlacedIds.length);
  }, [effectivePlacedIds.length, evaluateAchievements, stats]);

  // Match logic handler
  const handleMatchAttempt = (candidateSticker: Sticker, targetSlot: Sticker) => {
    if (candidateSticker.id === targetSlot.id) {
      // SUCCESSFUL MATCH!
      sounds.playStickSound();
      fireStickerConfetti();
      speakSpanish(targetSlot.spanish);

      const bonus = streak * 25;
      const pointsWon = 100 + bonus;
      const nextStreak = streak + 1;
      const nextScore = score + pointsWon;
      const updatedStreakList = [...recentStreakStickers, targetSlot].slice(-5);
      setRecentStreakStickers(updatedStreakList);

      setScore(nextScore);
      setStreak(nextStreak);

      setPlacedStickerIds(prev => [...prev, targetSlot.id]);
      setSelectedSticker(null);

      const nextStats = {
        ...stats,
        score: nextScore,
        streak: nextStreak,
        maxStreak: Math.max(stats.maxStreak, nextStreak),
        correctCount: stats.correctCount + 1,
      };
      setStats(nextStats);

      // If in multiplayer, notify server
      if (room && isInRoom) {
        placeStickerMultiplayer(targetSlot.id, pointsWon, true);
      }

      // Check if this finished the entire album!
      if (effectivePlacedIds.length + 1 >= allStickers.length) {
        fireWinConfetti();
        sounds.playPageCompleteSound();
      }

      const updatedPlaced = [...effectivePlacedIds, targetSlot.id];
      const allPlacedList = allStickers.filter(s => updatedPlaced.includes(s.id));
      const targetPage = pages.find(p => p.id === targetSlot.pageId);
      const isPageComplete = targetPage && targetPage.stickers.every(s => updatedPlaced.includes(s.id));

      const achContext: AchievementContext = {
        lastPlacedSticker: targetSlot,
        recentStreakStickers: updatedStreakList,
        completedPageStickers: isPageComplete ? targetPage.stickers : undefined,
        allPlacedStickers: allPlacedList,
      };

      evaluateAchievements(nextStats, effectivePlacedIds.length + 1, achContext);
    } else {
      // MISMATCH
      sounds.playMismatchSound();
      setStreak(0);
      setRecentStreakStickers([]);
      setScore(prev => Math.max(0, prev - 10));

      setMismatchedStickerId(targetSlot.id);
      setTimeout(() => setMismatchedStickerId(null), 800);

      const nextStats = {
        ...stats,
        streak: 0,
        errorCount: stats.errorCount + 1,
      };
      setStats(nextStats);

      if (room && isInRoom) {
        placeStickerMultiplayer(candidateSticker.id, 0, false);
      }
    }
  };

  const handleSlotClick = (targetSlot: Sticker) => {
    if (effectivePlacedIds.includes(targetSlot.id)) {
      setDetailSticker(targetSlot);
      return;
    }

    if (selectedSticker) {
      handleMatchAttempt(selectedSticker, targetSlot);
    } else {
      // Gentle hint sound
      sounds.playPickSound();
    }
  };

  const handleDropCard = (cardId: string, targetSlot: Sticker) => {
    const candidate = allStickers.find(s => s.id === cardId);
    if (candidate) {
      handleMatchAttempt(candidate, targetSlot);
    }
  };

  const handleShuffleDeck = () => {
    sounds.playPickSound();
    setPages(prev => [...prev]);
  };

  const handleAddCustomSticker = (newSticker: Sticker) => {
    setPages(prev => {
      return prev.map(page => {
        if (page.id === newSticker.pageId) {
          return {
            ...page,
            stickers: [...page.stickers, newSticker],
          };
        }
        return page;
      });
    });
  };

  const handleResetProgress = () => {
    setPlacedStickerIds([]);
    setScore(0);
    setStreak(0);
    setSoloTimerSeconds(0);
    setSelectedSticker(null);
    sounds.playPickSound();
  };

  const handleRestoreDefaults = () => {
    setPages(initialPages);
    setPlacedStickerIds([]);
    setScore(0);
    setStreak(0);
    setAchievements(INITIAL_ACHIEVEMENTS);
    sounds.playPickSound();
  };

  const activeTimerDisplay = (room && room.isGameActive)
    ? room.timeRemaining
    : soloTimerSeconds;

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-slate-800">
      {/* Top Header */}
      <Header
        score={score}
        streak={streak}
        totalCollected={effectivePlacedIds.length}
        totalStickers={allStickers.length}
        showPinyin={showPinyin}
        setShowPinyin={setShowPinyin}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenTeacherModal={() => setIsTeacherOpen(true)}
        timerSeconds={activeTimerDisplay}
        isMultiplayerActive={isInRoom}
      />

      {/* Achievement Unlocked Toast Notification */}
      {achievementToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white rounded-2xl p-4 shadow-2xl border-2 border-amber-400 flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl shrink-0">
            {achievementToast.icon}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> ¡Logro Desbloqueado!
            </span>
            <h4 className="font-bold text-sm text-slate-900 truncate font-heading">
              {achievementToast.titleEs}
            </h4>
            <p className="text-xs text-slate-500 font-sans truncate">
              {achievementToast.titleZh} (+{achievementToast.rewardPoints} pts)
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area based on Tab */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-4">
        {activeTab === 'multiplayer' && (
          <MultiplayerView
            room={room}
            playerId={playerId}
            reactions={reactions}
            onJoinRoom={(rid, name, avatar, mode) => {
              joinRoom(rid, name, avatar, mode);
              setStats(prev => ({
                ...prev,
                multiplayerGamesPlayed: prev.multiplayerGamesPlayed + 1,
              }));
            }}
            onStartGame={startGame}
            onResetGame={resetGame}
            onSendReaction={sendReaction}
            onLeaveRoom={leaveRoom}
            totalStickersCount={allStickers.length}
          />
        )}

        {/* The Album Spread */}
        <AlbumBook
          pages={pages}
          currentPageIndex={currentPageIndex}
          setCurrentPageIndex={setCurrentPageIndex}
          placedStickerIds={effectivePlacedIds}
          selectedSticker={selectedSticker}
          onSlotClick={handleSlotClick}
          onDropCard={handleDropCard}
          onOpenDetail={(stk) => setDetailSticker(stk)}
          showPinyin={showPinyin}
          sharedPlacements={room?.sharedPlacements}
          mismatchedStickerId={mismatchedStickerId}
        />
      </main>

      {/* Bottom Sticky Deck for Unplaced Cards */}
      <StickerDeck
        unplacedStickers={unplacedStickers}
        selectedSticker={selectedSticker}
        onSelectSticker={setSelectedSticker}
        onOpenPackModal={() => setIsBoosterOpen(true)}
        onShuffleDeck={handleShuffleDeck}
        currentPageTitle={pages[currentPageIndex]?.titleEs || ''}
        filterCurrentPageOnly={filterCurrentPageOnly}
        setFilterCurrentPageOnly={setFilterCurrentPageOnly}
      />

      {/* Modals */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
        totalCollected={effectivePlacedIds.length}
        totalStickers={allStickers.length}
        showPinyin={showPinyin}
      />

      <StickerDetailModal
        sticker={detailSticker}
        onClose={() => setDetailSticker(null)}
        showPinyin={showPinyin}
      />

      <BoosterPackModal
        isOpen={isBoosterOpen}
        onClose={() => setIsBoosterOpen(false)}
        unplacedStickers={unplacedStickers}
        allStickers={allStickers}
      />

      <TeacherEditorModal
        isOpen={isTeacherOpen}
        onClose={() => setIsTeacherOpen(false)}
        pages={pages}
        onAddCustomSticker={handleAddCustomSticker}
        onResetProgress={handleResetProgress}
        onRestoreDefaults={handleRestoreDefaults}
      />
    </div>
  );
}
