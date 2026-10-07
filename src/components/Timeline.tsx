import React, { useState } from 'react';
import { Clock, ArrowUpDown, Volume2, Sparkles, Award, CheckCircle, Calendar, ExternalLink } from 'lucide-react';
import { Achievement, AssociatedWord } from '../types/achievements';
import { speakSpanish } from '../utils/audio';

interface TimelineProps {
  achievements: Achievement[];
  showPinyin?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  achievements,
  showPinyin = true,
}) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter only unlocked achievements that have an unlockedAt timestamp
  const unlockedItems = achievements.filter(a => a.unlocked && a.unlockedAt);

  const sortedItems = [...unlockedItems].sort((a, b) => {
    const timeA = a.unlockedAt || 0;
    const timeB = b.unlockedAt || 0;
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const formatRelativeTime = (timestamp?: number) => {
    if (!timestamp) return 'Reciente';
    const diffMs = Date.now() - timestamp;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 45) return '¡Justo ahora!';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return new Date(timestamp).toLocaleDateString();
  };

  const formatFullDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleAudioPlay = (e: React.MouseEvent, spanish: string) => {
    e.stopPropagation();
    speakSpanish(spanish);
  };

  if (unlockedItems.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
          ⏳
        </div>
        <h4 className="text-lg font-bold text-slate-800 font-heading">
          Línea de Tiempo Vacía / 暂无成就解锁记录
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
          Los hitos que consigas al emparejar palabras (como tu primer cromo, el 50% o el 100% del álbum) se registrarán cronológicamente aquí junto con sus palabras clave.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>¡Empieza a pegar cromos para comenzar tu viaje!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* Timeline Controls Header */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-100 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            Cronología de Hitos Desbloqueados ({unlockedItems.length})
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">| 成就解锁时间轴</span>
        </div>

        <button
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{sortOrder === 'desc' ? 'Más recientes primero' : 'Primeros logros primero'}</span>
        </button>
      </div>

      {/* Vertical Timeline Track */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-orange-300 before:to-emerald-400">
        {sortedItems.map((item, idx) => {
          const associated = item.associatedWords || [];

          return (
            <div key={item.id} className="relative group animate-in fade-in slide-in-from-left-2 duration-300">
              {/* Spine Node Dot */}
              <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-amber-500 shadow-md flex items-center justify-center text-xs sm:text-sm font-bold group-hover:scale-110 transition-transform ring-4 ring-amber-100">
                {item.icon}
              </div>

              {/* Milestone Card */}
              <div className="bg-slate-50/90 hover:bg-white border border-slate-200/90 hover:border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all">
                {/* Header: Title and Time */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-slate-900 font-heading">
                        {item.titleEs}
                      </h4>
                      <span className="text-xs text-slate-500 font-sans font-medium">
                        {item.titleZh}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {item.descriptionEs}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-xs">
                      +{item.rewardPoints} pts
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-700 block">
                        {formatFullDate(item.unlockedAt)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatRelativeTime(item.unlockedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Milestone context note if available */}
                {item.milestoneContext && (
                  <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{item.milestoneContext}</span>
                  </div>
                )}

                {/* Associated Words Section (Las palabras asociadas a esos hitos) */}
                {associated.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/70">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                      <span>Palabras clave asociadas al hito / 关联词汇:</span>
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {associated.map((word) => (
                        <div
                          key={word.id}
                          className="bg-white border border-slate-200 hover:border-amber-300 rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-2xs group/word transition-all hover:-translate-y-0.5"
                        >
                          <span className="text-base">{word.emoji}</span>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 leading-tight font-heading">
                              {word.spanish}
                            </span>
                            <span className="text-[10px] text-slate-500 font-sans leading-tight">
                              {word.chinese} {showPinyin && word.pinyin && <span className="font-mono text-amber-800 text-[9px]">({word.pinyin})</span>}
                            </span>
                          </div>

                          <button
                            onClick={(e) => handleAudioPlay(e, word.spanish)}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors ml-0.5"
                            title={`Escuchar "${word.spanish}"`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
