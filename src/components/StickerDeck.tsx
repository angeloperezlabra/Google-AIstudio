import React from 'react';
import { Volume2, Sparkles, HelpCircle, Package, Shuffle, CheckCircle2 } from 'lucide-react';
import { Sticker } from '../types/sticker';
import { speakSpanish, sounds } from '../utils/audio';

interface StickerDeckProps {
  unplacedStickers: Sticker[];
  selectedSticker: Sticker | null;
  onSelectSticker: (sticker: Sticker | null) => void;
  onOpenPackModal: () => void;
  onShuffleDeck: () => void;
  currentPageTitle: string;
  filterCurrentPageOnly: boolean;
  setFilterCurrentPageOnly: (val: boolean) => void;
}

export const StickerDeck: React.FC<StickerDeckProps> = ({
  unplacedStickers,
  selectedSticker,
  onSelectSticker,
  onOpenPackModal,
  onShuffleDeck,
  currentPageTitle,
  filterCurrentPageOnly,
  setFilterCurrentPageOnly,
}) => {
  const handleDragStart = (e: React.DragEvent, sticker: Sticker) => {
    e.dataTransfer.setData('text/plain', sticker.id);
    onSelectSticker(sticker);
    sounds.playPickSound();
  };

  const handleAudioPreview = (e: React.MouseEvent, spanish: string) => {
    e.stopPropagation();
    speakSpanish(spanish);
  };

  const handleCardClick = (sticker: Sticker) => {
    if (selectedSticker?.id === sticker.id) {
      onSelectSticker(null);
    } else {
      onSelectSticker(sticker);
      sounds.playPickSound();
    }
  };

  return (
    <section className="bg-white/95 backdrop-blur-md border-t border-amber-200/90 shadow-xl fixed bottom-0 left-0 right-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3">
        {/* Top Deck Control Bar */}
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 font-heading text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse" />
              Mazo de Cromos por Pegar ({unplacedStickers.length})
            </span>
            <span className="text-slate-400 hidden sm:inline">| 待贴西班牙语卡牌</span>
          </div>

          {/* Quick Filter & Pack Opening */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterCurrentPageOnly(!filterCurrentPageOnly)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors border ${
                filterCurrentPageOnly
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filterCurrentPageOnly ? `Solo: ${currentPageTitle}` : 'Ver todos'}
            </button>

            <button
              onClick={onShuffleDeck}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors"
              title="Mezclar cromos"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenPackModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-xs transition-all active:scale-95"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Abrir Sobre</span>
            </button>
          </div>
        </div>

        {/* Selected card helper alert */}
        {selectedSticker && (
          <div className="mb-2 px-3 py-1 rounded-lg bg-amber-100/80 border border-amber-300 flex items-center justify-between text-xs text-amber-900 animate-in fade-in">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Cromo seleccionado: <strong>{selectedSticker.spanish}</strong>. ¡Haz clic en su espacio en chino arriba para pegarlo!
            </span>
            <button
              onClick={() => onSelectSticker(null)}
              className="text-amber-800 hover:text-amber-950 font-bold underline text-[11px]"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Stickers Horizontal Scroll Container */}
        {unplacedStickers.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-center text-slate-500">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1 text-xl">
              🎉
            </div>
            <p className="font-bold text-slate-800 text-sm">¡Todos los cromos están pegados en el álbum!</p>
            <p className="text-xs text-slate-500 mt-0.5">Puedes abrir un nuevo sobre o reiniciar el álbum para seguir practicando.</p>
          </div>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-1 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-transparent">
            {unplacedStickers.map((sticker) => {
              const isSelected = selectedSticker?.id === sticker.id;

              return (
                <div
                  key={sticker.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, sticker)}
                  onClick={() => handleCardClick(sticker)}
                  className={`shrink-0 w-44 sm:w-52 rounded-xl p-2.5 transition-all duration-200 cursor-grab active:cursor-grabbing select-none border-2 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-100 to-orange-100 border-amber-500 shadow-md ring-3 ring-amber-400/40 -translate-y-1'
                      : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono font-bold text-slate-400">
                      #{sticker.slotNumber < 10 ? `0${sticker.slotNumber}` : sticker.slotNumber}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      {sticker.category}
                    </span>
                  </div>

                  <div className="my-1">
                    <span className="font-bold text-sm sm:text-base text-slate-800 block truncate font-heading leading-tight">
                      {sticker.spanish}
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={(e) => handleAudioPreview(e, sticker.spanish)}
                      className="p-1 rounded-md hover:bg-amber-100 text-slate-600 hover:text-amber-800 transition-colors"
                      title="Escuchar pronunciación"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[10px] text-slate-500 font-medium">
                      Arrastra o haz clic
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
