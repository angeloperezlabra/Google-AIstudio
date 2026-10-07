import React, { useState } from 'react';
import { X, Trophy, CheckCircle, Lock, Award, Sparkles, Clock, ListChecks } from 'lucide-react';
import { Achievement } from '../types/achievements';
import { Timeline } from './Timeline';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  totalCollected: number;
  totalStickers: number;
  showPinyin?: boolean;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  totalCollected,
  totalStickers,
  showPinyin = true,
}) => {
  const [viewMode, setViewMode] = useState<'badges' | 'timeline'>('badges');

  if (!isOpen) return null;

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const percentCollected = totalStickers > 0 ? Math.round((totalCollected / totalStickers) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-amber-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center text-3xl shadow-inner">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-heading">Sala de Trofeos y Logros</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-semibold tracking-wide">
                  成就与徽章
                </span>
              </div>
              <p className="text-amber-100 text-sm mt-0.5">
                Desbloquea insignias al coleccionar cromos y visualiza tu cronología de hitos
              </p>
            </div>
          </div>

          {/* Quick Progress Summary */}
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-center">
            <div className="bg-black/10 rounded-xl p-2.5">
              <span className="text-xs text-amber-100 font-medium block">Progreso del Álbum</span>
              <span className="text-xl font-extrabold text-white">
                {totalCollected}/{totalStickers} <span className="text-sm font-normal text-amber-200">({percentCollected}%)</span>
              </span>
            </div>
            <div className="bg-black/10 rounded-xl p-2.5">
              <span className="text-xs text-amber-100 font-medium block">Logros Desbloqueados</span>
              <span className="text-xl font-extrabold text-white">
                {unlockedCount}/{achievements.length}
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs: Insignias vs Línea de Tiempo */}
        <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-200/60 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('badges')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'badges'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white hover:bg-amber-100/80 text-slate-700 border border-amber-200'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Insignias y Retos</span>
            </button>

            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                viewMode === 'timeline'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white hover:bg-amber-100/80 text-slate-700 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Línea de Tiempo (Timeline)</span>
              {unlockedCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                  viewMode === 'timeline' ? 'bg-amber-200 text-amber-950' : 'bg-amber-500 text-white'
                }`}>
                  {unlockedCount}
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-amber-900 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Hitos clave: <strong>50%</strong> y <strong>100%</strong></span>
          </div>
        </div>

        {/* Body based on active view mode */}
        <div className="p-6 overflow-y-auto flex-1">
          {viewMode === 'timeline' ? (
            <Timeline
              achievements={achievements}
              showPinyin={showPinyin}
            />
          ) : (
            <div className="space-y-3.5 divide-y divide-slate-100">
              {achievements.map((item) => {
                const isUnlocked = item.unlocked;
                const progress = Math.min(item.currentValue, item.targetValue);
                const progressPercent = Math.min(100, Math.round((progress / item.targetValue) * 100));

                return (
                  <div
                    key={item.id}
                    className={`pt-3.5 first:pt-0 flex items-start gap-4 transition-all ${
                      isUnlocked ? 'opacity-100' : 'opacity-85'
                    }`}
                  >
                    {/* Icon box */}
                    <div
                      className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl border shadow-xs relative transition-transform ${
                        isUnlocked
                          ? 'bg-amber-100/80 border-amber-300 ring-2 ring-amber-400/40 shadow-md scale-105'
                          : 'bg-slate-100 border-slate-200 text-slate-400 grayscale'
                      }`}
                    >
                      <span>{item.icon}</span>
                      {isUnlocked ? (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 bg-slate-400 text-white rounded-full p-0.5 shadow-xs">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-bold text-sm sm:text-base ${isUnlocked ? 'text-slate-900' : 'text-slate-700'}`}>
                            {item.titleEs}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium">
                            {item.titleZh}
                          </span>
                        </div>

                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                          +{item.rewardPoints} pts
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.descriptionEs}
                      </p>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                        {item.descriptionZh}
                      </p>

                      {/* Progress bar */}
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isUnlocked
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                : 'bg-gradient-to-r from-amber-400 to-orange-400'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-500 min-w-[50px] text-right">
                          {progress}/{item.targetValue} ({progressPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>
              {viewMode === 'timeline' 
                ? 'Cronología actualizada en tiempo real con cada palabra acertada'
                : 'Sigue emparejando palabras en el álbum para desbloquearlos todos'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
