import React, { useState } from 'react';
import { LearnedWord, LearnedGrammar, LearnedReading, LearnedListening } from '../types';
import {
  X,
  Brain,
  Sparkles,
  Volume2,
  Bookmark,
  CheckCircle2,
  Search,
  Trash2,
  Layers,
  RotateCcw,
  BookOpen,
  Filter,
  Mic,
  Headphones,
  FileText
} from 'lucide-react';
import {
  getLearnedWords,
  getLearnedGrammar,
  getLearnedReadings,
  getLearnedListenings,
  saveLearnedWords,
  saveLearnedGrammar,
  saveLearnedReadings,
  saveLearnedListenings,
  toggleWordMastery,
  toggleGrammarMastery,
  toggleReadingMastery,
  toggleListeningMastery
} from '../utils/learningMemory';
import { playAudioPronunciation } from '../utils/speechUtils';
import { PronunciationCoachModal, PronunciationCoachTarget } from './speech/PronunciationCoachModal';
import { FlashcardDeckModal } from './flashcard/FlashcardDeckModal';

interface MemoryBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoryUpdated?: () => void;
}

export const MemoryBankModal: React.FC<MemoryBankModalProps> = ({
  isOpen,
  onClose,
  onMemoryUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'words' | 'grammar' | 'reading' | 'listening'>('words');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  const [words, setWords] = useState<LearnedWord[]>(() => getLearnedWords());
  const [grammar, setGrammar] = useState<LearnedGrammar[]>(() => getLearnedGrammar());
  const [readings, setReadings] = useState<LearnedReading[]>(() => getLearnedReadings());
  const [listenings, setListenings] = useState<LearnedListening[]>(() => getLearnedListenings());

  // Pronunciation Coach Modal State
  const [coachTarget, setCoachTarget] = useState<PronunciationCoachTarget | null>(null);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // Reload when opened
  React.useEffect(() => {
    if (isOpen) {
      setWords(getLearnedWords());
      setGrammar(getLearnedGrammar());
      setReadings(getLearnedReadings());
      setListenings(getLearnedListenings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const speakText = (text: string, rate: number = 1.0) => {
    setSpeakingWord(text);
    playAudioPronunciation(text, {
      rate,
      onStart: () => setSpeakingWord(text),
      onEnd: () => setSpeakingWord(null),
      onError: () => setSpeakingWord(null),
    });
  };

  const handleOpenCoach = (target: PronunciationCoachTarget) => {
    setCoachTarget(target);
    setIsCoachOpen(true);
  };

  const handleToggleWord = (id: string) => {
    const updated = toggleWordMastery(id);
    setWords(updated);
    onMemoryUpdated?.();
  };

  const handleToggleGrammar = (id: string) => {
    const updated = toggleGrammarMastery(id);
    setGrammar(updated);
    onMemoryUpdated?.();
  };

  const handleToggleReading = (id: string) => {
    const updated = toggleReadingMastery(id);
    setReadings(updated);
    onMemoryUpdated?.();
  };

  const handleToggleListening = (id: string) => {
    const updated = toggleListeningMastery(id);
    setListenings(updated);
    onMemoryUpdated?.();
  };

  const handleDeleteWord = (id: string) => {
    const filtered = words.filter((w) => w.id !== id);
    saveLearnedWords(filtered);
    setWords(filtered);
    onMemoryUpdated?.();
  };

  const handleDeleteGrammar = (id: string) => {
    const filtered = grammar.filter((g) => g.id !== id);
    saveLearnedGrammar(filtered);
    setGrammar(filtered);
    onMemoryUpdated?.();
  };

  const handleDeleteReading = (id: string) => {
    const filtered = readings.filter((r) => r.id !== id);
    saveLearnedReadings(filtered);
    setReadings(filtered);
    onMemoryUpdated?.();
  };

  const handleDeleteListening = (id: string) => {
    const filtered = listenings.filter((l) => l.id !== id);
    saveLearnedListenings(filtered);
    setListenings(filtered);
    onMemoryUpdated?.();
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm mới toàn bộ sổ tay bộ nhớ học? AI sẽ có thể gợi ý lại các bài này.')) {
      saveLearnedWords([]);
      saveLearnedGrammar([]);
      saveLearnedReadings([]);
      saveLearnedListenings([]);
      setWords([]);
      setGrammar([]);
      setReadings([]);
      setListenings([]);
      onMemoryUpdated?.();
    }
  };

  const filteredWords = (words || []).filter((w) => {
    if (!w) return false;
    const term = (w.term || '').toLowerCase();
    const meaning = (w.vietnameseMeaning || '').toLowerCase();
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch = !q || term.includes(q) || meaning.includes(q);
    if (!matchesSearch) return false;
    if (filterMode === 'mastered') return !!w.mastered;
    if (filterMode === 'unmastered') return !w.mastered;
    return true;
  });

  const filteredGrammar = (grammar || []).filter((g) => {
    if (!g) return false;
    const rule = (g.ruleName || '').toLowerCase();
    const formula = (g.formula || '').toLowerCase();
    const meaning = (g.vietnameseMeaning || '').toLowerCase();
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch = !q || rule.includes(q) || formula.includes(q) || meaning.includes(q);
    if (!matchesSearch) return false;
    if (filterMode === 'mastered') return !!g.mastered;
    if (filterMode === 'unmastered') return !g.mastered;
    return true;
  });

  const filteredReadings = (readings || []).filter((r) => {
    if (!r) return false;
    const title = (r.title || '').toLowerCase();
    const passage = (r.passage || '').toLowerCase();
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch = !q || title.includes(q) || passage.includes(q);
    if (!matchesSearch) return false;
    if (filterMode === 'mastered') return !!r.mastered;
    if (filterMode === 'unmastered') return !r.mastered;
    return true;
  });

  const filteredListenings = (listenings || []).filter((l) => {
    if (!l) return false;
    const title = (l.title || '').toLowerCase();
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch = !q || title.includes(q);
    if (!matchesSearch) return false;
    if (filterMode === 'mastered') return !!l.mastered;
    if (filterMode === 'unmastered') return !l.mastered;
    return true;
  });

  const masteredWordCount = (words || []).filter((w) => w?.mastered).length;
  const masteredGrammarCount = (grammar || []).filter((g) => g?.mastered).length;
  const masteredReadingCount = (readings || []).filter((r) => r?.mastered).length;
  const masteredListeningCount = (listenings || []).filter((l) => l?.mastered).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-950 border border-neutral-700 rounded-none w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-none bg-neutral-800 border border-neutral-700 text-purple-400 shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>BỘ NHỚ LƯU TRỮ ĐÃ HỌC</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-none bg-emerald-950 text-emerald-400 border border-emerald-800">
                  CHỐNG LẶP LẠI 100%
                </span>
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Toàn bộ từ vựng và cấu trúc bạn đã học được lưu tại đây. AI dùng dữ liệu này để không sinh lặp lại và làm bài tập cho Tab Luyện Phản Xạ.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-none text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer border border-neutral-800"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-neutral-900/40 border-b border-neutral-800">
          <div className="p-3 rounded-none bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block">TỔNG TỪ VỰNG</span>
            <span className="text-xl font-black text-sky-400 font-mono">{words.length}</span>
            <span className="text-[10px] text-neutral-500 block font-mono">ĐÃ THUỘC: {masteredWordCount} ⭐</span>
          </div>

          <div className="p-3 rounded-none bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block">MẪU CÂU NGỮ PHÁP</span>
            <span className="text-xl font-black text-indigo-400 font-mono">{grammar.length}</span>
            <span className="text-[10px] text-neutral-500 block font-mono">ĐÃ VỮNG: {masteredGrammarCount} ⭐</span>
          </div>

          <div className="p-3 rounded-none bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block">BÀI ĐỌC HIỂU</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{readings.length}</span>
            <span className="text-[10px] text-neutral-500 block font-mono">ĐÃ HIỂU: {masteredReadingCount} ⭐</span>
          </div>

          <div className="p-3 rounded-none bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block">BÀI NGHE HIỂU</span>
            <span className="text-xl font-black text-amber-400 font-mono">{listenings.length}</span>
            <span className="text-[10px] text-neutral-500 block font-mono">ĐÃ HIỂU: {masteredListeningCount} ⭐</span>
          </div>
        </div>

        {/* Filter and Tab Controls */}
        <div className="p-4 border-b border-neutral-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('words')}
              className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 uppercase whitespace-nowrap ${
                activeTab === 'words'
                  ? 'bg-sky-600 text-white border border-sky-400'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>TỪ VỰNG [{words.length}]</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('grammar')}
              className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 uppercase whitespace-nowrap ${
                activeTab === 'grammar'
                  ? 'bg-indigo-600 text-white border border-indigo-400'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>NGỮ PHÁP [{grammar.length}]</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reading')}
              className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 uppercase whitespace-nowrap ${
                activeTab === 'reading'
                  ? 'bg-emerald-600 text-white border border-emerald-400'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ĐỌC [{readings.length}]</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('listening')}
              className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 uppercase whitespace-nowrap ${
                activeTab === 'listening'
                  ? 'bg-amber-600 text-white border border-amber-400'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>NGHE [{listenings.length}]</span>
            </button>
          </div>

          {/* Search Bar & Filter Buttons */}
          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'words'
                    ? 'Tìm từ, nghĩa tiếng Việt...'
                    : activeTab === 'grammar'
                    ? 'Tìm cấu trúc, công thức...'
                    : activeTab === 'reading'
                    ? 'Tìm bài đọc...'
                    : 'Tìm bài nghe...'
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-none pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-0.5 bg-neutral-900 p-0.5 rounded-none border border-neutral-800 shrink-0 font-mono">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2 py-1 rounded-none text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  filterMode === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                TẤT CẢ
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('unmastered')}
                className={`px-2 py-1 rounded-none text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  filterMode === 'unmastered' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                CẦN ÔN
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('mastered')}
                className={`px-2 py-1 rounded-none text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  filterMode === 'mastered' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                ĐÃ THUỘC
              </button>
            </div>

            {activeTab === 'words' && filteredWords.length > 0 && (
              <button
                type="button"
                onClick={() => setIsFlashcardOpen(true)}
                className="px-3 py-1.5 rounded-none bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-mono font-black uppercase flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm shrink-0"
                title="Luyện bộ thẻ Flashcard 3D cho danh sách từ vựng này"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🎴 FLASHCARD ({filteredWords.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Content List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'words' && (
            <>
              {filteredWords.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 space-y-2">
                  <Brain className="w-10 h-10 mx-auto text-neutral-600" />
                  <p className="text-xs font-mono uppercase font-bold text-neutral-400">[ CHƯA CÓ TỪ VỰNG TRONG DANH MỤC NÀY ]</p>
                  <p className="text-xs text-neutral-600 font-sans">
                    Bấm vào Tab "📚 Từ Vựng Cốt Lõi" và ấn "Tạo bài học", hệ thống sẽ tự động lưu lại từ vựng cho bạn.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredWords.map((word) => (
                    <div
                      key={word.id}
                      className="p-4 rounded-none bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-black text-white tracking-tight">
                              {word.term}
                            </h4>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => speakText(word.term, 1.0)}
                                className="p-1 rounded-none bg-neutral-800 hover:bg-neutral-700 text-sky-400 transition-colors cursor-pointer border border-neutral-700"
                                title="Nghe phát âm chuẩn (1.0x)"
                              >
                                <Volume2 className={`w-3.5 h-3.5 ${speakingWord === word.term ? 'animate-bounce' : ''}`} />
                              </button>
                              <button
                                type="button"
                                onClick={() => speakText(word.term, 0.7)}
                                className="px-1.5 py-0.5 rounded-none bg-neutral-850 hover:bg-neutral-750 text-amber-400 text-[10px] font-mono transition-colors cursor-pointer border border-neutral-750"
                                title="Nghe chậm (0.7x)"
                              >
                                🐢 0.7x
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenCoach({
                                    term: word.term,
                                    ipa: word.ipa,
                                    vietnamesePhonetic: word.vietnamesePhonetic,
                                    vietnameseMeaning: word.vietnameseMeaning,
                                    level: word.level,
                                  })
                                }
                                className="p-1 rounded-none bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 transition-colors cursor-pointer border border-emerald-800"
                                title="Luyện đọc từ này và chấm điểm"
                              >
                                <Mic className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-neutral-950 text-neutral-400 border border-neutral-800">
                              [{word.level}]
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleWord(word.id)}
                              className={`p-1 rounded-none border transition-colors cursor-pointer ${
                                word.mastered
                                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                                  : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-amber-400'
                              }`}
                              title={word.mastered ? 'Đã thuộc (Bấm để chuyển sang cần ôn)' : 'Đánh dấu đã thuộc'}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${word.mastered ? 'fill-emerald-400' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWord(word.id)}
                              className="p-1 rounded-none bg-neutral-950 hover:bg-neutral-800 text-neutral-600 hover:text-rose-400 transition-colors cursor-pointer border border-neutral-800"
                              title="Xóa khỏi bộ nhớ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs font-mono text-neutral-400">
                          {word.ipa} • <span className="text-neutral-500">{word.partOfSpeech}</span>
                        </div>

                        {word.vietnamesePhonetic && (
                          <div className="text-[10px] text-purple-300 font-mono bg-purple-950/50 px-2 py-0.5 rounded-none border border-purple-900/60 inline-block">
                            ĐỌC LÀ: "{word.vietnamesePhonetic}"
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-neutral-200 font-medium pt-1 font-sans">
                          {word.vietnameseMeaning}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-800 pt-2 font-mono">
                        <span>
                          LƯU:{' '}
                          {word.learnedAt
                            ? (() => {
                                try {
                                  const d = new Date(word.learnedAt);
                                  return isNaN(d.getTime()) ? 'Gần đây' : d.toLocaleDateString('vi-VN');
                                } catch {
                                  return 'Gần đây';
                                }
                              })()
                            : 'Gần đây'}
                        </span>
                        <span className={word.mastered ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {word.mastered ? '[ ⭐ ĐÃ THUỘC ]' : '[ 🔄 CẦN ÔN ]'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'grammar' && (
            <>
              {filteredGrammar.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 space-y-2">
                  <Layers className="w-10 h-10 mx-auto text-neutral-600" />
                  <p className="text-xs font-mono uppercase font-bold text-neutral-400">[ CHƯA CÓ CẤU TRÚC NGỮ PHÁP NÀO ]</p>
                  <p className="text-xs text-neutral-600 font-sans">
                    Bấm vào Tab "🧩 Ngữ Pháp Ghép Câu" và bấm "Tạo bài học", hệ thống sẽ tự động lưu lại mẫu câu cho bạn.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGrammar.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-none bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                            [{item.level}]
                          </span>
                          <h4 className="text-sm sm:text-base font-black text-white uppercase">
                            {item.ruleName}
                          </h4>
                        </div>

                        <div className="p-2 rounded-none bg-neutral-950 border border-neutral-800 text-xs font-mono font-bold text-amber-300 inline-block">
                          {item.formula}
                        </div>

                        <p className="text-xs text-neutral-300 font-sans">
                          Ý nghĩa: {item.vietnameseMeaning}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleGrammar(item.id)}
                          className={`px-3 py-1.5 rounded-none border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 uppercase ${
                            item.mastered
                              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-amber-400'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${item.mastered ? 'fill-emerald-400' : ''}`} />
                          <span>{item.mastered ? 'THÀNH THẠO ⭐' : 'CẦN LUYỆN'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteGrammar(item.id)}
                          className="p-1.5 rounded-none bg-neutral-950 hover:bg-neutral-800 text-neutral-600 hover:text-rose-400 transition-colors cursor-pointer border border-neutral-800"
                          title="Xóa khỏi bộ nhớ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'reading' && (
            <>
              {filteredReadings.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-neutral-600" />
                  <p className="text-xs font-mono uppercase font-bold text-neutral-400">[ CHƯA CÓ BÀI ĐỌC HIỂU NÀO ]</p>
                  <p className="text-xs text-neutral-600 font-sans">
                    Vào Tab "📖 Đọc hiểu / Reading", tạo bài học và bấm "⭐ ĐÃ HIỂU BÀI ĐỌC" để lưu vào sổ tay.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReadings.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-none bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                            [{item.level}]
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-neutral-800 text-neutral-400 border border-neutral-700 font-bold">
                            #{item.topic}
                          </span>
                          <h4 className="text-sm sm:text-base font-black text-white uppercase">
                            {item.title}
                          </h4>
                        </div>

                        <div className="p-2.5 rounded-none bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 font-sans leading-relaxed">
                          <p className="line-clamp-3 italic font-serif text-neutral-200">
                            "{item.passage}"
                          </p>
                          {item.vietnameseTranslation && (
                            <p className="line-clamp-2 text-[11px] text-neutral-500 font-sans mt-1.5 border-t border-neutral-900 pt-1">
                              {item.vietnameseTranslation}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => speakText(item.passage.slice(0, 300), 1.0)}
                            className="px-2.5 py-1 rounded-none bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>NGHE BÀI ĐỌC</span>
                          </button>
                          {item.keyVocabulary && item.keyVocabulary.length > 0 && (
                            <span className="text-[10px] font-mono text-neutral-500">
                              {item.keyVocabulary.length} TỪ KHÓA ĐÃ GHI NHỚ
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleReading(item.id)}
                          className={`px-3 py-1.5 rounded-none border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 uppercase ${
                            item.mastered
                              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-emerald-400'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${item.mastered ? 'fill-emerald-400' : ''}`} />
                          <span>{item.mastered ? 'ĐÃ VỮNG ⭐' : 'CẦN LUYỆN'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReading(item.id)}
                          className="p-1.5 rounded-none bg-neutral-950 hover:bg-neutral-800 text-neutral-600 hover:text-rose-400 transition-colors cursor-pointer border border-neutral-800"
                          title="Xóa khỏi bộ nhớ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'listening' && (
            <>
              {filteredListenings.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 space-y-2">
                  <Headphones className="w-10 h-10 mx-auto text-neutral-600" />
                  <p className="text-xs font-mono uppercase font-bold text-neutral-400">[ CHƯA CÓ BÀI NGHE HIỂU NÀO ]</p>
                  <p className="text-xs text-neutral-600 font-sans">
                    Vào Tab "🎧 Nghe hiểu / Listening", tạo bài học và bấm "⭐ ĐÃ HIỂU BÀI NGHE" để lưu vào sổ tay.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredListenings.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-none bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                            [{item.level}]
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-neutral-800 text-neutral-400 border border-neutral-700 font-bold">
                            #{item.topic}
                          </span>
                          <h4 className="text-sm sm:text-base font-black text-white uppercase">
                            {item.title}
                          </h4>
                        </div>

                        {item.dialogue && item.dialogue.length > 0 && (
                          <div className="p-2.5 rounded-none bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 space-y-1">
                            <span className="text-[10px] text-neutral-500 uppercase block font-bold">Trích đoạn hội thoại:</span>
                            {item.dialogue.slice(0, 2).map((d, dIdx) => (
                              <div key={dIdx} className="text-neutral-300">
                                <span className="text-amber-400 font-bold">{d.speaker}:</span> {d.text}
                              </div>
                            ))}
                            {item.dialogue.length > 2 && (
                              <span className="text-[10px] text-neutral-500 block">...và {item.dialogue.length - 2} câu tiếp theo</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              const fullText = (item.dialogue || []).map(d => `${d.speaker}: ${d.text}`).join('. ');
                              speakText(fullText.slice(0, 300), 1.0);
                            }}
                            className="px-2.5 py-1 rounded-none bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>NGHE 1.0X</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const fullText = (item.dialogue || []).map(d => `${d.speaker}: ${d.text}`).join('. ');
                              speakText(fullText.slice(0, 300), 0.7);
                            }}
                            className="px-2 py-1 rounded-none bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-[10px] font-mono font-bold cursor-pointer"
                          >
                            <span>0.7X CHẬM</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleListening(item.id)}
                          className={`px-3 py-1.5 rounded-none border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 uppercase ${
                            item.mastered
                              ? 'bg-amber-950/80 border-amber-800 text-amber-400'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-amber-400'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${item.mastered ? 'fill-amber-400' : ''}`} />
                          <span>{item.mastered ? 'ĐÃ VỮNG ⭐' : 'CẦN LUYỆN'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteListening(item.id)}
                          className="p-1.5 rounded-none bg-neutral-950 hover:bg-neutral-800 text-neutral-600 hover:text-rose-400 transition-colors cursor-pointer border border-neutral-800"
                          title="Xóa khỏi bộ nhớ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between bg-neutral-900/60 text-xs font-mono">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-neutral-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer uppercase font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>[ XÓA SẠCH BỘ NHỚ ]</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-none font-black transition-colors cursor-pointer uppercase border border-neutral-700"
          >
            ĐÓNG
          </button>
        </div>
      </div>

      {/* Pronunciation Coach Modal */}
      <PronunciationCoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        target={coachTarget}
      />

      {/* Flashcard Deck Modal */}
      <FlashcardDeckModal
        isOpen={isFlashcardOpen}
        onClose={() => setIsFlashcardOpen(false)}
        items={filteredWords.map((w) => ({
          id: w.id,
          term: w.term,
          ipa: w.ipa,
          vietnamesePhonetic: w.vietnamesePhonetic,
          partOfSpeech: w.partOfSpeech,
          vietnameseMeaning: w.vietnameseMeaning,
          wordFamilyDetails: w.wordFamilyDetails,
          exampleSentence: w.exampleSentence,
          exampleTranslation: w.exampleTranslation,
          mastered: w.mastered,
          level: w.level,
          reviewCount: w.reviewCount,
        }))}
        title={`FLASHCARD TỪ VỰNG TRONG SỔ NHỚ (${filteredWords.length} TỪ)`}
        onMemoryUpdated={() => {
          setWords(getLearnedWords());
          onMemoryUpdated?.();
        }}
      />
    </div>
  );
};
