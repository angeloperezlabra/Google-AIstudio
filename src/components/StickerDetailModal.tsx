import React from 'react';
import { X, Volume2, Sparkles, BookOpen, ExternalLink, CheckCircle } from 'lucide-react';
import { Sticker } from '../types/sticker';
import { speakSpanish, speakChinese } from '../utils/audio';

interface StickerDetailModalProps {
  sticker: Sticker | null;
  onClose: () => void;
  showPinyin: boolean;
}

export const StickerDetailModal: React.FC<StickerDetailModalProps> = ({
  sticker,
  onClose,
  showPinyin,
}) => {
  if (!sticker) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Large Header Banner with Image */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-900">
          <img
            src={sticker.imageUrl}
            alt={sticker.spanish}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-white px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs">
              Cromo #{sticker.slotNumber < 10 ? `0${sticker.slotNumber}` : sticker.slotNumber}
            </span>
            {sticker.badge && (
              <span className="text-xs font-bold text-amber-950 bg-amber-300 px-2 py-1 rounded-lg shadow-xs">
                {sticker.badge}
              </span>
            )}
          </div>

          {/* Main Spanish word on image banner */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <span className="text-xs text-amber-300 uppercase tracking-wider font-bold block mb-0.5">
                Español / 西班牙语
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading leading-tight drop-shadow-md">
                {sticker.spanish}
              </h2>
            </div>
            <button
              onClick={() => speakSpanish(sticker.spanish)}
              className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg transition-transform hover:scale-110 active:scale-95 flex items-center gap-1.5"
              title="Escuchar pronunciación en español"
            >
              <Volume2 className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Chinese meaning & Pinyin card */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                Significado en Chino / 中文释义
              </span>
              <h3 className="text-xl font-bold text-slate-800 font-sans mt-0.5">
                {sticker.chinese}
              </h3>
              {showPinyin && (
                <p className="text-sm text-amber-800 font-mono font-medium mt-0.5">
                  {sticker.pinyin}
                </p>
              )}
            </div>
            <button
              onClick={() => speakChinese(sticker.chinese)}
              className="p-2.5 rounded-xl bg-white hover:bg-amber-100 text-slate-700 border border-amber-200 transition-colors"
              title="Escuchar en chino"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Example Sentence with Audio */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                Ejemplo en contexto / 例句学习
              </span>
              <button
                onClick={() => speakSpanish(sticker.exampleEs, 0.85)}
                className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
                title="Escuchar frase completa"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Escuchar frase</span>
              </button>
            </div>

            <p className="text-sm font-semibold text-slate-800 leading-relaxed font-sans">
              "{sticker.exampleEs}"
            </p>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              “{sticker.exampleZh}”
            </p>
          </div>

          {/* Grammar Category Pill */}
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-medium">
              Categoría: <strong className="text-slate-700 capitalize">{sticker.category}</strong>
            </span>
            {sticker.gender !== 'ninguno' && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-medium">
                Género gramatical: <strong className="text-slate-700 capitalize">{sticker.gender}</strong>
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Cromo coleccionado
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            Volver al Álbum
          </button>
        </div>
      </div>
    </div>
  );
};
