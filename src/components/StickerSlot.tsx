import React, { useState } from 'react';
import { Volume2, Sparkles, Check, Info } from 'lucide-react';
import { Sticker } from '../types/sticker';
import { speakSpanish } from '../utils/audio';

interface StickerSlotProps {
  sticker: Sticker;
  isPlaced: boolean;
  isSelectedForDrop?: boolean;
  onSlotClick: (sticker: Sticker) => void;
  onDropCard?: (cardId: string) => void;
  onOpenDetail?: (sticker: Sticker) => void;
  showPinyin: boolean;
  placedByName?: string;
  isMismatched?: boolean;
}

export const StickerSlot: React.FC<StickerSlotProps> = ({
  sticker,
  isPlaced,
  isSelectedForDrop,
  onSlotClick,
  onDropCard,
  onOpenDetail,
  showPinyin,
  placedByName,
  isMismatched,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId && onDropCard) {
      onDropCard(cardId);
    }
  };

  const handleAudioPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakSpanish(sticker.spanish);
  };

  // Color theme based on category & gender
  const articleColor = sticker.gender === 'femenino' 
    ? 'text-pink-600 bg-pink-50 border-pink-200' 
    : sticker.gender === 'masculino' 
    ? 'text-blue-600 bg-blue-50 border-blue-200' 
    : 'text-amber-700 bg-amber-50 border-amber-200';

  if (!isPlaced) {
    // EMPTY GRAY SLOT (As described by the user: "se muestra como gris")
    return (
      <div
        onClick={() => onSlotClick(sticker)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl p-4 transition-all duration-200 cursor-pointer select-none border-2 border-dashed flex flex-col justify-between min-h-[220px] sm:min-h-[240px] text-center ${
          isMismatched
            ? 'border-rose-400 bg-rose-50/70 animate-shake ring-2 ring-rose-300'
            : isDragOver || isSelectedForDrop
            ? 'border-amber-500 bg-amber-100/60 ring-4 ring-amber-400/40 scale-[1.02] shadow-lg'
            : 'border-slate-300 bg-slate-100/90 hover:border-amber-400 hover:bg-amber-50/40 shadow-xs'
        }`}
      >
        {/* Slot Number Tag */}
        <div className="flex items-center justify-between text-xs w-full">
          <span className="font-mono font-bold text-slate-400 px-2 py-0.5 rounded-md bg-slate-200/60">
            #{sticker.slotNumber < 10 ? `0${sticker.slotNumber}` : sticker.slotNumber}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {sticker.category}
          </span>
        </div>

        {/* Gray Silhouette Icon / Emoji */}
        <div className="my-auto flex flex-col items-center justify-center py-2">
          <div className="w-16 h-16 rounded-2xl bg-slate-200/70 border border-slate-300/60 flex items-center justify-center text-3xl grayscale opacity-45 mb-3 shadow-inner">
            {sticker.emoji}
          </div>

          {/* Chinese Word in Album (What is in the album initially) */}
          <h4 className="text-base sm:text-lg font-bold text-slate-700 font-sans tracking-wide">
            {sticker.chinese}
          </h4>

          {/* Optional Pinyin */}
          {showPinyin && (
            <span className="text-xs text-amber-700/80 font-mono mt-0.5 font-medium">
              {sticker.pinyin}
            </span>
          )}
        </div>

        {/* Bottom invitation hint */}
        <div className="w-full pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
          <span className="text-amber-600 font-bold">Pega aquí el cromo</span>
          <span className="text-slate-400">/ 贴上西语</span>
        </div>
      </div>
    );
  }

  // PLACED VIBRANT COLOR STICKER (As described: "cuando ponen la palabra en español se vuelva de color y quizás aparece algo como una foto")
  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(sticker)}
      className="group relative rounded-2xl overflow-hidden bg-white border border-amber-200/90 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer min-h-[220px] sm:min-h-[240px] flex flex-col animate-peel-in"
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Top Image Banner with Photo */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-100">
        <img
          src={sticker.imageUrl}
          alt={sticker.spanish}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Slot number and badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="font-mono text-[10px] font-bold text-white px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs">
            #{sticker.slotNumber < 10 ? `0${sticker.slotNumber}` : sticker.slotNumber}
          </span>
          {sticker.badge && (
            <span className="text-[10px] font-bold text-amber-900 bg-amber-300/90 px-1.5 py-0.5 rounded-md shadow-xs">
              {sticker.badge}
            </span>
          )}
        </div>

        {/* Who placed badge in collaborative multiplayer */}
        {placedByName && (
          <div className="absolute top-2 right-2 bg-indigo-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <span>👤</span>
            <span className="truncate max-w-[80px]">{placedByName}</span>
          </div>
        )}

        {/* Audio speech button */}
        <button
          onClick={handleAudioPlay}
          className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md transition-transform hover:scale-110 active:scale-95"
          title="Escuchar pronunciación en español"
        >
          <Volume2 className="w-4 h-4 text-amber-600" />
        </button>

        {/* Spanish Word on Image Bottom */}
        <div className="absolute bottom-2 left-2 right-10">
          <span className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow-md block truncate font-heading">
            {sticker.spanish}
          </span>
        </div>
      </div>

      {/* Card Body with Chinese meaning and detail hint */}
      <div className="p-3 flex-1 flex flex-col justify-between bg-amber-50/20">
        <div>
          {/* Chinese meaning */}
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-slate-800 text-sm truncate font-sans">
              {sticker.chinese}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${articleColor}`}>
              {sticker.gender === 'femenino' ? 'fem.' : sticker.gender === 'masculino' ? 'masc.' : sticker.category}
            </span>
          </div>

          {/* Pinyin */}
          {showPinyin && (
            <p className="text-xs text-amber-800 font-mono font-medium mt-0.5 truncate">
              {sticker.pinyin}
            </p>
          )}
        </div>

        {/* Card Footer: Detail info hint */}
        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <Check className="w-3 h-3" />
            ¡Pegado!
          </span>
          <span className="flex items-center gap-1 text-slate-500 hover:text-amber-700 transition-colors">
            <Info className="w-3 h-3" />
            Ver frase
          </span>
        </div>
      </div>

      {/* Subtle glossy border shimmer */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-amber-400/20" />
    </div>
  );
};
