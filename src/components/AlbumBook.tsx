import React from 'react';
import { ChevronLeft, ChevronRight, Award, CheckCircle, Sparkles, BookOpen } from 'lucide-react';
import { AlbumPage, Sticker } from '../types/sticker';
import { StickerSlot } from './StickerSlot';

interface AlbumBookProps {
  pages: AlbumPage[];
  currentPageIndex: number;
  setCurrentPageIndex: (idx: number) => void;
  placedStickerIds: string[];
  selectedSticker: Sticker | null;
  onSlotClick: (sticker: Sticker) => void;
  onDropCard: (cardId: string, targetSticker: Sticker) => void;
  onOpenDetail: (sticker: Sticker) => void;
  showPinyin: boolean;
  sharedPlacements?: Record<string, { placedByName: string }>;
  mismatchedStickerId?: string | null;
}

export const AlbumBook: React.FC<AlbumBookProps> = ({
  pages,
  currentPageIndex,
  setCurrentPageIndex,
  placedStickerIds,
  selectedSticker,
  onSlotClick,
  onDropCard,
  onOpenDetail,
  showPinyin,
  sharedPlacements,
  mismatchedStickerId,
}) => {
  const currentPage = pages[currentPageIndex] || pages[0];
  if (!currentPage) return null;

  const pageStickers = currentPage.stickers || [];
  const placedOnThisPage = pageStickers.filter(s => placedStickerIds.includes(s.id)).length;
  const isPageFullyCompleted = pageStickers.length > 0 && placedOnThisPage === pageStickers.length;

  const goToPrev = () => {
    if (currentPageIndex > 0) setCurrentPageIndex(currentPageIndex - 1);
  };

  const goToNext = () => {
    if (currentPageIndex < pages.length - 1) setCurrentPageIndex(currentPageIndex + 1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-48 pt-2">
      {/* Album Page Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 scrollbar-none">
        {pages.map((page, idx) => {
          const isCurrent = idx === currentPageIndex;
          const pagePlaced = page.stickers.filter(s => placedStickerIds.includes(s.id)).length;
          const isComplete = pagePlaced === page.stickers.length && page.stickers.length > 0;

          return (
            <button
              key={page.id}
              onClick={() => setCurrentPageIndex(idx)}
              className={`shrink-0 px-4 py-2 rounded-2xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border ${
                isCurrent
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md shadow-amber-600/20 scale-[1.02]'
                  : 'bg-white hover:bg-amber-50/80 text-slate-700 border-amber-200/80 shadow-xs'
              }`}
            >
              <span className="text-base">{page.icon}</span>
              <span className="font-heading">{page.titleEs}</span>
              <span className="text-[11px] opacity-80 font-normal">({page.titleZh})</span>
              {isComplete ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white ml-0.5" />
              ) : (
                <span className="text-[10px] font-mono opacity-70">
                  {pagePlaced}/{page.stickers.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Album Book Cover / Open Spread */}
      <div className="album-paper rounded-3xl border-4 border-amber-800/20 shadow-2xl overflow-hidden relative p-4 sm:p-8">
        {/* Subtle binder spine decoration */}
        <div className="absolute top-0 bottom-0 left-1/2 w-12 -translate-x-1/2 pointer-events-none hidden lg:block opacity-10 bg-gradient-to-r from-transparent via-slate-900 to-transparent" />

        {/* Page Header Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-amber-200/80 relative">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-200/80 border border-amber-300 flex items-center justify-center text-3xl shadow-xs">
              {currentPage.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Página {currentPageIndex + 1} de {pages.length}
                </span>
                <span className="text-xs font-semibold text-slate-500 font-sans">
                  第 {currentPageIndex + 1} 页
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-heading mt-1 flex items-center gap-2">
                {currentPage.titleEs}
                <span className="text-lg font-normal text-slate-500 font-sans">
                  ({currentPage.titleZh})
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {currentPage.descriptionEs}
                <span className="text-slate-400 ml-1">· {currentPage.descriptionZh}</span>
              </p>
            </div>
          </div>

          {/* Page Completion Stamp & Arrows */}
          <div className="flex items-center gap-4 self-end md:self-center">
            {isPageFullyCompleted ? (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 px-4 py-2 rounded-2xl shadow-md border-2 border-amber-300 animate-in zoom-in-90 duration-300">
                <Award className="w-6 h-6 fill-amber-950" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black uppercase tracking-wider leading-none">
                    ¡Página Completada!
                  </span>
                  <span className="text-[10px] font-bold opacity-80 leading-tight">
                    本页全收集达成 100%
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 border border-amber-200 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 shadow-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-slate-700">
                  {placedOnThisPage} de {pageStickers.length} cromos
                </span>
              </div>
            )}

            {/* Page flip buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrev}
                disabled={currentPageIndex === 0}
                className="p-2 rounded-xl bg-white border border-amber-200 text-slate-700 hover:bg-amber-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-xs"
                title="Página anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                disabled={currentPageIndex === pages.length - 1}
                className="p-2 rounded-xl bg-white border border-amber-200 text-slate-700 hover:bg-amber-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-xs"
                title="Página siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sticker Slots Grid (Responsive 2 to 3 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative">
          {pageStickers.map((sticker) => {
            const isPlaced = placedStickerIds.includes(sticker.id);
            const isSelectedForDrop = selectedSticker?.id === sticker.id;
            const placedInfo = sharedPlacements ? sharedPlacements[sticker.id] : undefined;
            const isMismatched = mismatchedStickerId === sticker.id;

            return (
              <StickerSlot
                key={sticker.id}
                sticker={sticker}
                isPlaced={isPlaced}
                isSelectedForDrop={isSelectedForDrop}
                onSlotClick={onSlotClick}
                onDropCard={(cardId) => onDropCard(cardId, sticker)}
                onOpenDetail={onOpenDetail}
                showPinyin={showPinyin}
                placedByName={placedInfo?.placedByName}
                isMismatched={isMismatched}
              />
            );
          })}
        </div>

        {/* Bottom Page Numbering */}
        <div className="mt-8 pt-4 border-t border-amber-200/60 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>ÁLBUM OFICIAL DE ESPAÑOL UNIVERSITARIO</span>
          <span className="font-bold text-slate-600">
            - PÁGINA {currentPageIndex + 1} -
          </span>
          <span>COLECCIÓN INTERACTIVA</span>
        </div>
      </div>
    </div>
  );
};
