import React, { useState } from 'react';
import { X, Package, Sparkles, Check } from 'lucide-react';
import { Sticker } from '../types/sticker';
import { sounds } from '../utils/audio';
import { fireStickerConfetti } from '../utils/confetti';

interface BoosterPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  unplacedStickers: Sticker[];
  allStickers: Sticker[];
}

export const BoosterPackModal: React.FC<BoosterPackModalProps> = ({
  isOpen,
  onClose,
  unplacedStickers,
  allStickers,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [packCards, setPackCards] = useState<Sticker[]>([]);

  if (!isOpen) return null;

  const handleOpenPack = () => {
    sounds.playPackOpenSound();
    // Pick 3 random cards from unplaced or all
    const pool = unplacedStickers.length >= 3 ? unplacedStickers : allStickers;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setPackCards(selected);
    setIsOpened(true);
    fireStickerConfetti();
  };

  const handleReset = () => {
    setIsOpened(false);
    setPackCards([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-amber-200 p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2.5 py-1 rounded-full">
            Sobre de Colección / 开卡包
          </span>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isOpened ? (
          <div>
            {/* Sealed booster foil packet graphic */}
            <div 
              onClick={handleOpenPack}
              className="w-48 h-64 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-300 to-orange-500 p-1 shadow-2xl hover:scale-105 transition-transform cursor-pointer relative group flex flex-col justify-between overflow-hidden foil-shimmer border-2 border-yellow-200"
            >
              {/* Foil packet jagged edges */}
              <div className="h-3 w-full bg-amber-500/30 flex justify-between items-center px-1">
                <span className="text-[9px] font-mono font-bold text-amber-950">✦ FOIL PACK ✦</span>
              </div>

              <div className="my-auto p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-xs mx-auto flex items-center justify-center text-3xl mb-2 shadow-inner">
                  🇪🇸
                </div>
                <h3 className="font-heading font-extrabold text-xl text-amber-950">
                  ¡CromoEspañol!
                </h3>
                <span className="text-xs font-bold text-amber-900 block mt-1">
                  Serie Universitaria
                </span>
                <span className="text-[10px] text-amber-800 block">
                  Contiene 3 cromos coleccionables
                </span>
              </div>

              <div className="bg-amber-950/20 py-2 text-[11px] font-bold text-amber-950 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>¡Toca para rasgar y abrir!</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              Abre sobres para descubrir nuevas palabras y completar tu álbum más rápido
            </p>

            <button
              onClick={handleOpenPack}
              className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-md transition-all active:scale-95"
            >
              Rasgar Sobre Ahora
            </button>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl mb-2">
              ✨
            </div>
            <h3 className="text-xl font-bold font-heading text-slate-800">
              ¡Cromos Descubiertos!
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Aquí tienes tus 3 estampas. ¡Búscalas en tu álbum y pégalas!
            </p>

            <div className="space-y-2 mb-6">
              {packCards.map((card, idx) => (
                <div
                  key={`${card.id}-${idx}`}
                  className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-left animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{card.emoji}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 font-heading">
                        {card.spanish}
                      </h4>
                      <p className="text-xs text-slate-500 font-sans">
                        {card.chinese} <span className="text-[11px] font-mono text-amber-800">({card.pinyin})</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    #{card.slotNumber}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Otro sobre
              </button>
              <button
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
              >
                Volver a Pegar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
