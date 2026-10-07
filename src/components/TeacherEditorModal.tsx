import React, { useState } from 'react';
import { X, Plus, Trash2, RotateCcw, Save, Sparkles, BookOpen } from 'lucide-react';
import { AlbumPage, Sticker, WordCategory, Gender } from '../types/sticker';

interface TeacherEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: AlbumPage[];
  onAddCustomSticker: (sticker: Sticker) => void;
  onResetProgress: () => void;
  onRestoreDefaults: () => void;
}

export const TeacherEditorModal: React.FC<TeacherEditorModalProps> = ({
  isOpen,
  onClose,
  pages,
  onAddCustomSticker,
  onResetProgress,
  onRestoreDefaults,
}) => {
  const [targetPageId, setTargetPageId] = useState(pages[0]?.id || 'cafeteria');
  const [spanish, setSpanish] = useState('');
  const [article, setArticle] = useState('el');
  const [chinese, setChinese] = useState('');
  const [pinyin, setPinyin] = useState('');
  const [category, setCategory] = useState<WordCategory>('sustantivo');
  const [gender, setGender] = useState<Gender>('masculino');
  const [exampleEs, setExampleEs] = useState('');
  const [exampleZh, setExampleZh] = useState('');
  const [emoji, setEmoji] = useState('📝');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spanish.trim() || !chinese.trim()) return;

    const targetPage = pages.find(p => p.id === targetPageId);
    const newSlotNumber = (targetPage?.stickers.length || 0) + 1;

    const newSticker: Sticker = {
      id: `custom-${Date.now()}`,
      pageId: targetPageId,
      slotNumber: newSlotNumber,
      spanish: spanish.trim(),
      article: category === 'sustantivo' ? article : undefined,
      category,
      gender,
      exampleEs: exampleEs.trim() || `Aprendo la palabra ${spanish} en clase de español.`,
      chinese: chinese.trim(),
      pinyin: pinyin.trim() || '',
      exampleZh: exampleZh.trim() || `我在西班牙语课上学习 ${chinese}。`,
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
      emoji: emoji || '🌟',
      bgGradient: 'from-amber-500 to-orange-600',
      badge: 'Personalizado',
    };

    onAddCustomSticker(newSticker);
    setSpanish('');
    setChinese('');
    setPinyin('');
    setExampleEs('');
    setExampleZh('');
    setSuccessMsg('¡Cromo creado con éxito y añadido al álbum!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-amber-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-bold">
              👨‍🏫
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">Modo Profesor / 教师管理模式</h3>
              <p className="text-xs text-slate-400">Añade nuevo vocabulario o reinicia el progreso para tu clase</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {/* Add Word Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-600" />
              Añadir Nuevo Cromo al Álbum
            </h4>

            {/* Target Page */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Página de destino:</label>
              <select
                value={targetPageId}
                onChange={(e) => setTargetPageId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
              >
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.titleEs} ({p.titleZh})
                  </option>
                ))}
              </select>
            </div>

            {/* Spanish Word & Article */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Artículo:</label>
                <select
                  value={article}
                  onChange={(e) => setArticle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                >
                  <option value="el">el</option>
                  <option value="la">la</option>
                  <option value="un">un</option>
                  <option value="una">una</option>
                  <option value="">(ninguno)</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Palabra en español:</label>
                <input
                  type="text"
                  value={spanish}
                  onChange={(e) => setSpanish(e.target.value)}
                  placeholder="Ej. el cuaderno"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  required
                />
              </div>
            </div>

            {/* Chinese & Pinyin */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Significado en chino:</label>
                <input
                  type="text"
                  value={chinese}
                  onChange={(e) => setChinese(e.target.value)}
                  placeholder="Ej. 笔记本"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pinyin:</label>
                <input
                  type="text"
                  value={pinyin}
                  onChange={(e) => setPinyin(e.target.value)}
                  placeholder="Ej. bǐ jì běn"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                />
              </div>
            </div>

            {/* Category & Emoji */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as WordCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="sustantivo">Sustantivo</option>
                  <option value="verbo">Verbo</option>
                  <option value="adjetivo">Adjetivo</option>
                  <option value="expresion">Expresión</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Género:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="ninguno">Ninguno</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emoji icono:</label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="📓"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-center"
                />
              </div>
            </div>

            {/* Example sentence */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Frase de ejemplo (Español):</label>
              <input
                type="text"
                value={exampleEs}
                onChange={(e) => setExampleEs(e.target.value)}
                placeholder="Ej. Escribo mis notas en el cuaderno."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Traducción de la frase (Chino):</label>
              <input
                type="text"
                value={exampleZh}
                onChange={(e) => setExampleZh(e.target.value)}
                placeholder="Ej. 我在笔记本上做记录。"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Cromo en el Álbum</span>
            </button>
          </form>

          {/* Teacher Class Management Actions */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Gestión de Clase y Sesión
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Quieres reiniciar todas las estampas pegadas para comenzar una nueva práctica?')) {
                    onResetProgress();
                    setSuccessMsg('Álbum vaciado para nueva práctica.');
                  }
                }}
                className="flex-1 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Vaciar Álbum (Nueva Actividad)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Restaurar vocabulario predeterminado?')) {
                    onRestoreDefaults();
                    setSuccessMsg('Vocabulario predeterminado restaurado.');
                  }
                }}
                className="flex-1 py-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Predeterminados</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
