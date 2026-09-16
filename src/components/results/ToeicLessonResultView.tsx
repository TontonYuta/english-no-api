import React, { useState, useMemo } from 'react';
import { ToeicLessonResult, ToeicWord } from '../../types';
import {
  Volume2,
  Sparkles,
  Mail,
  FileText,
  MessageSquare,
  Users,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
  Layers,
  Repeat,
  Mic,
  Bookmark
} from 'lucide-react';
import { shuffleOptionsWithCorrectIndex } from '../../utils/quizUtils';
import { playAudioPronunciation } from '../../utils/speechUtils';
import { PronunciationCoachModal, PronunciationCoachTarget } from '../speech/PronunciationCoachModal';
import { getLearnedWords, toggleWordMastery } from '../../utils/learningMemory';
import { FlashcardDeckView } from '../flashcard/FlashcardDeckView';

interface ToeicLessonResultViewProps {
  result: ToeicLessonResult;
  onGenerateAnother?: () => void;
  isAutomating?: boolean;
}

export const ToeicLessonResultView: React.FC<ToeicLessonResultViewProps> = ({
  result,
  onGenerateAnother,
  isAutomating,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const [vocabDisplayMode, setVocabDisplayMode] = useState<'grid' | 'flashcard'>('grid');

  // Pronunciation Coach Modal State
  const [coachTarget, setCoachTarget] = useState<PronunciationCoachTarget | null>(null);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // Word Mastery State
  const [masteredMap, setMasteredMap] = useState<Record<string, boolean>>(() => {
    try {
      const words = getLearnedWords();
      const map: Record<string, boolean> = {};
      words.forEach((w) => {
        if (w.mastered && w.term) map[w.term.toLowerCase()] = true;
      });
      return map;
    } catch {
      return {};
    }
  });

  const handleToggleMastery = (term: string) => {
    toggleWordMastery(term);
    setMasteredMap((prev) => ({
      ...prev,
      [term.toLowerCase()]: !prev[term.toLowerCase()],
    }));
  };

  // Interactive Challenge State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Word Form Practice Challenge State (per word card)
  const [wordFormAnswers, setWordFormAnswers] = useState<Record<number, number>>({});

  const handleSelectWordFormOption = (wordIdx: number, optIdx: number) => {
    setWordFormAnswers((prev) => ({
      ...prev,
      [wordIdx]: optIdx,
    }));
  };

  // Shuffle options so correct answer is randomly distributed among A, B, C, D
  const { shuffledOptions, newCorrectIndex, cleanedExplanation } = useMemo(() => {
    if (!result.interactiveChallenge?.options) {
      return { shuffledOptions: [], newCorrectIndex: 0, cleanedExplanation: '' };
    }
    return shuffleOptionsWithCorrectIndex(
      result.interactiveChallenge.options,
      result.interactiveChallenge.correctIndex ?? 0,
      result.interactiveChallenge.explanation || ''
    );
  }, [result.interactiveChallenge]);

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

  const handleCopyLesson = () => {
    const text = `🎯 TOEIC 700+ Lesson: ${result.situationTitle} (${result.topic})\n\n[Scenario]\n${result.scenarioText}\n\n[Vocabulary]\n${result.targetWords
      .map(
        (w) =>
          `• ${w.term} (${w.ipa}) [${w.partOfSpeech}]: ${w.vietnameseMeaning}\n  Family: ${w.wordFamily || 'N/A'}\n  Paraphrase: ${w.toeicParaphrase || 'N/A'}`
      )
      .join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSituationIcon = () => {
    switch (result.situationType) {
      case 'email':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'memo':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'meeting':
        return <Users className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bell className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Lesson Header Banner */}
      <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/70">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>TOEIC PROGRESSIVE SCENARIO</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                LEVEL {result.userLevel || 'A1'}
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-300 border border-zinc-700/40 flex items-center gap-1">
                {getSituationIcon()}
                <span className="capitalize">{result.situationType || 'Business Scenario'}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {result.situationTitle}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Chủ đề: <strong className="text-sky-300">{result.topic}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleCopyLesson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-zinc-800/80 hover:bg-zinc-750 text-zinc-200 transition-colors cursor-pointer border border-zinc-700/60 uppercase"
              title="Sao chép tóm tắt"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'ĐÃ CHÉP' : 'SAO CHÉP'}</span>
            </button>

            {onGenerateAnother && (
              <button
                type="button"
                disabled={isAutomating}
                onClick={onGenerateAnother}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all border border-sky-400 cursor-pointer disabled:opacity-50 uppercase shadow-sm"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isAutomating ? 'animate-spin' : ''}`} />
                <span>{isAutomating ? 'ĐANG TẠO...' : 'ĐỔI BÀI KHÁC'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Workplace Scenario Reader Box */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <span>🏢 BỐI CẢNH THỰC TẾ (AUTHENTIC CONTEXT)</span>
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => speakText(result.scenarioText, 1.0)}
                className="flex items-center gap-1 text-xs font-mono text-sky-400 hover:text-sky-300 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-750 border border-sky-500/30 transition-colors cursor-pointer"
                title="Nghe toàn bộ đoạn văn (tốc độ chuẩn 1.0x)"
              >
                <Volume2 className={`w-3.5 h-3.5 ${speakingWord === result.scenarioText ? 'animate-bounce' : ''}`} />
                <span>🔊 1.0x</span>
              </button>

              <button
                type="button"
                onClick={() => speakText(result.scenarioText, 0.75)}
                className="flex items-center gap-1 text-xs font-mono text-amber-400 hover:text-amber-300 px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-750 border border-amber-500/30 transition-colors cursor-pointer"
                title="Nghe chậm toàn bộ đoạn văn (0.75x)"
              >
                <span>🐢 0.75x</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleOpenCoach({
                    term: result.situationTitle,
                    exampleSentence: result.scenarioText,
                    exampleTranslation: result.scenarioTranslationVi,
                    level: 'A1-B2',
                  })
                }
                className="flex items-center gap-1 text-xs font-mono text-emerald-400 hover:text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer"
                title="Luyện đọc đoạn văn và chấm điểm"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>🎙️ LUYỆN ĐỌC</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className="flex items-center gap-1 text-xs font-mono text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 transition-colors cursor-pointer"
              >
                {showTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showTranslation ? 'ẨN BẢN DỊCH' : 'XEM DỊCH'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-850/50 border border-zinc-800/80 text-zinc-100 text-sm leading-relaxed font-sans">
            {result.scenarioText}
          </div>

          {showTranslation && (
            <div className="p-3.5 rounded-lg bg-sky-950/20 border-l-2 border-l-sky-500 border border-sky-900/30 text-xs text-zinc-300 leading-relaxed font-sans">
              <strong className="text-sky-300 block mb-1 font-mono uppercase">Bản dịch tiếng Việt:</strong>
              {result.scenarioTranslationVi}
            </div>
          )}
        </div>
      </div>

      {/* Target Vocabulary Section (Grid vs 3D Flashcard Deck) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{result.targetWords?.length || 3} TỪ VỰNG / COLLOCATIONS VÀNG CHUẨN 700+</span>
            </h3>
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">[ PART 5 &amp; 7 FOCUS ]</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setVocabDisplayMode('grid')}
              className={`px-3 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                vocabDisplayMode === 'grid'
                  ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border-zinc-800'
              }`}
            >
              <span>📋 Lưới chi tiết</span>
            </button>
            <button
              type="button"
              onClick={() => setVocabDisplayMode('flashcard')}
              className={`px-3 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                vocabDisplayMode === 'flashcard'
                  ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-sky-300 border-zinc-800'
              }`}
            >
              <span>🎴 Thẻ Flashcard 3D</span>
            </button>
          </div>
        </div>

        {vocabDisplayMode === 'flashcard' ? (
          <FlashcardDeckView
            items={(result.targetWords || []).map((word) => ({
              term: word.term,
              ipa: word.ipa,
              vietnamesePhonetic: word.vietnamesePhonetic,
              partOfSpeech: word.partOfSpeech,
              vietnameseMeaning: word.vietnameseMeaning,
              wordFamilyDetails: word.wordFamilyDetails,
              exampleSentence: word.exampleSentence || result.scenarioText,
              exampleTranslation: word.exampleTranslation || result.scenarioTranslationVi,
              simpleBreakdown: word.simpleBreakdown,
              etsTrapTip: word.etsTrapTip,
              mastered: !!masteredMap[word.term.toLowerCase()],
            }))}
            title={`FLASHCARD BÀI HỌC: ${result.situationTitle}`}
            onWordMastered={(term, mastered) => {
              setMasteredMap((prev) => ({ ...prev, [term.toLowerCase()]: mastered }));
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.targetWords?.map((word: ToeicWord, idx: number) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
            >
              <div className="space-y-3">
                {/* Word Header & Audio */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-800/70">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xl font-bold text-white tracking-tight">
                        {word.term}
                      </h4>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => speakText(word.term, 1.0)}
                          className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-sky-400 transition-colors cursor-pointer border border-zinc-700/60"
                          title="Nghe phát âm chuẩn (1.0x)"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${speakingWord === word.term ? 'animate-bounce' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => speakText(word.term, 0.7)}
                          className="px-1.5 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-amber-400 text-[10px] font-mono transition-colors cursor-pointer border border-zinc-700/60"
                          title="Nghe chậm từng âm tiết (0.7x)"
                        >
                          🐢 0.7x
                        </button>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 block mt-0.5 font-mono">
                      {word.ipa} • <span className="text-zinc-500 font-sans italic">{word.partOfSpeech}</span>
                    </span>
                    {word.vietnamesePhonetic && (
                      <div className="mt-1 px-2 py-0.5 rounded-md bg-zinc-800/70 border border-zinc-700/50 text-[10px] text-zinc-300 font-sans inline-flex items-center gap-1">
                        <span>Đọc là: "{word.vietnamesePhonetic}"</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono text-zinc-500">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenCoach({
                          term: word.term,
                          ipa: word.ipa,
                          vietnamesePhonetic: word.vietnamesePhonetic,
                          vietnameseMeaning: word.vietnameseMeaning,
                          exampleSentence: result.scenarioText,
                          exampleTranslation: result.scenarioTranslationVi,
                        })
                      }
                      className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Luyện phát âm từ này và chấm điểm ngay"
                    >
                      <Mic className="w-3 h-3 text-emerald-400" />
                      <span>LUYỆN ĐỌC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleMastery(word.term)}
                      className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        masteredMap[word.term.toLowerCase()]
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-zinc-800/80 hover:bg-zinc-750 border-zinc-700/60 text-zinc-400 hover:text-amber-300'
                      }`}
                      title={
                        masteredMap[word.term.toLowerCase()]
                          ? 'Đã thuộc lòng (Bấm để chuyển sang cần ôn)'
                          : 'Đánh dấu đã thuộc từ này'
                      }
                    >
                      <Bookmark
                        className={`w-3 h-3 ${
                          masteredMap[word.term.toLowerCase()]
                            ? 'fill-emerald-400 text-emerald-400'
                            : ''
                        }`}
                      />
                      <span>{masteredMap[word.term.toLowerCase()] ? 'ĐÃ THUỘC' : 'ĐÁNH DẤU'}</span>
                    </button>
                  </div>
                </div>

                {/* Meaning */}
                <div className="border-l-2 border-sky-500 pl-3 py-1 space-y-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 block">
                    Ý NGHĨA TIẾNG VIỆT:
                  </span>
                  <p className="text-sm font-semibold text-zinc-100 font-sans leading-snug">
                    {word.vietnameseMeaning}
                  </p>
                </div>

                {/* Word Family Matrix */}
                {(word.wordFamilyDetails || word.wordFamily) && (
                  <div className="space-y-2 pt-1 border-t border-zinc-850">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Họ từ vựng (Word Family):</span>
                      </span>
                    </div>

                    {word.wordFamilyDetails ? (
                      <div className="grid grid-cols-2 gap-2">
                        {word.wordFamilyDetails.noun && (
                          <div className="p-2 rounded-md bg-zinc-850/70 border border-zinc-800 flex items-start justify-between gap-1.5">
                            <div className="overflow-hidden">
                              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase block">Danh từ</span>
                              <span className="text-xs font-bold text-zinc-200 font-sans truncate block">{word.wordFamilyDetails.noun}</span>
                              {word.wordFamilyDetails.nounMeaning && (
                                <span className="text-[10px] text-zinc-400 font-sans italic block">↳ {word.wordFamilyDetails.nounMeaning}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => speakText(word.wordFamilyDetails!.noun!)}
                              className="text-zinc-400 hover:text-sky-300 p-1 cursor-pointer shrink-0 mt-0.5"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {word.wordFamilyDetails.verb && (
                          <div className="p-2 rounded-md bg-zinc-850/70 border border-zinc-800 flex items-start justify-between gap-1.5">
                            <div className="overflow-hidden">
                              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase block">Động từ</span>
                              <span className="text-xs font-bold text-zinc-200 font-sans truncate block">{word.wordFamilyDetails.verb}</span>
                              {word.wordFamilyDetails.verbMeaning && (
                                <span className="text-[10px] text-zinc-400 font-sans italic block">↳ {word.wordFamilyDetails.verbMeaning}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => speakText(word.wordFamilyDetails!.verb!)}
                              className="text-zinc-400 hover:text-sky-300 p-1 cursor-pointer shrink-0 mt-0.5"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {word.wordFamilyDetails.adjective && (
                          <div className="p-2 rounded-md bg-zinc-850/70 border border-zinc-800 flex items-start justify-between gap-1.5">
                            <div className="overflow-hidden">
                              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase block">Tính từ</span>
                              <span className="text-xs font-bold text-zinc-200 font-sans truncate block">{word.wordFamilyDetails.adjective}</span>
                              {word.wordFamilyDetails.adjectiveMeaning && (
                                <span className="text-[10px] text-zinc-400 font-sans italic block">↳ {word.wordFamilyDetails.adjectiveMeaning}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => speakText(word.wordFamilyDetails!.adjective!)}
                              className="text-zinc-400 hover:text-sky-300 p-1 cursor-pointer shrink-0 mt-0.5"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {word.wordFamilyDetails.adverb && (
                          <div className="p-2 rounded-md bg-zinc-850/70 border border-zinc-800 flex items-start justify-between gap-1.5">
                            <div className="overflow-hidden">
                              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase block">Trạng từ</span>
                              <span className="text-xs font-bold text-zinc-200 font-sans truncate block">{word.wordFamilyDetails.adverb}</span>
                              {word.wordFamilyDetails.adverbMeaning && (
                                <span className="text-[10px] text-zinc-400 font-sans italic block">↳ {word.wordFamilyDetails.adverbMeaning}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => speakText(word.wordFamilyDetails!.adverb!)}
                              className="text-zinc-400 hover:text-sky-300 p-1 cursor-pointer shrink-0 mt-0.5"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-300 font-mono bg-zinc-850 px-2.5 py-1.5 rounded-md border border-zinc-800">
                        {word.wordFamily}
                      </p>
                    )}
                  </div>
                )}

                {/* Synonyms Matrix */}
                {word.synonyms && word.synonyms.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                    <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Từ đồng nghĩa (Synonyms):</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {word.synonyms.map((syn, sIdx) => {
                        const sWord = typeof syn === 'string' ? syn : syn.word;
                        const sMeaning = typeof syn === 'string' ? undefined : syn.meaning;
                        const sNuance = typeof syn === 'string' ? undefined : syn.nuance;
                        return (
                          <div key={sIdx} className="px-2.5 py-1 rounded-md bg-zinc-850/80 border border-emerald-900/50 text-xs">
                            <span className="font-bold text-emerald-300 font-mono">{sWord}</span>
                            {sMeaning && <span className="text-zinc-300 text-[11px] ml-1.5">({sMeaning})</span>}
                            {sNuance && <span className="text-zinc-500 text-[10px] block font-mono">↳ {sNuance}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Word Form Practice Challenge */}
                {word.wordFormExercise && (
                  <div className="p-3.5 rounded-lg bg-zinc-850/40 border border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-sky-400 flex items-center gap-1 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        <span>Luyện Word Form (Part 5):</span>
                      </span>
                      {word.wordFormExercise.targetForm && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                          Cần: {word.wordFormExercise.targetForm}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-200 font-medium font-sans leading-relaxed">
                      "{word.wordFormExercise.sentence}"
                    </p>

                    <div className="grid grid-cols-2 gap-1.5">
                      {word.wordFormExercise.options.map((opt: string, optIdx: number) => {
                        const isAnswered = wordFormAnswers[idx] !== undefined;
                        const isSelected = wordFormAnswers[idx] === optIdx;
                        const isCorrect = optIdx === word.wordFormExercise!.correctIndex;

                        let btnClass = 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800';
                        if (isAnswered) {
                          if (isCorrect) {
                            btnClass = 'bg-emerald-500/15 text-emerald-200 border-emerald-500/50 font-bold';
                          } else if (isSelected) {
                            btnClass = 'bg-rose-500/15 text-rose-200 border-rose-500/50';
                          } else {
                            btnClass = 'opacity-40 bg-zinc-900 text-zinc-500 border-zinc-800';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isAnswered}
                            onClick={() => handleSelectWordFormOption(idx, optIdx)}
                            className={`p-2 rounded-lg border text-xs text-left transition-colors cursor-pointer flex items-center justify-between ${btnClass}`}
                          >
                            <span className="font-mono">
                              <span className="text-zinc-500 mr-1.5 font-bold">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              {opt}
                            </span>
                            {isAnswered && isCorrect && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                            {isAnswered && isSelected && !isCorrect && <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {wordFormAnswers[idx] !== undefined && (
                      <div className="p-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-[11px] text-zinc-200 font-sans leading-relaxed">
                        <strong className="text-sky-300 font-mono block mb-0.5 uppercase">
                          {wordFormAnswers[idx] === word.wordFormExercise.correctIndex ? '✓ CHÍNH XÁC!' : '✕ GIẢI THÍCH:'}
                        </strong>
                        {word.wordFormExercise.explanation}
                      </div>
                    )}
                  </div>
                )}

                {word.toeicParaphrase && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                      <Repeat className="w-3 h-3 text-zinc-400" />
                      <span>Từ đồng nghĩa (Part 7):</span>
                    </span>
                    <p className="text-xs text-zinc-300 font-mono bg-zinc-850 px-2.5 py-1.5 rounded-md border border-zinc-800">
                      {word.toeicParaphrase}
                    </p>
                  </div>
                )}

                {/* Example sentence */}
                <div className="space-y-1 pt-2 border-t border-zinc-850">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>VÍ DỤ THỰC CHIẾN:</span>
                    <button
                      type="button"
                      onClick={() => speakText(word.exampleSentence)}
                      className="text-sky-400 hover:text-sky-300 cursor-pointer p-0.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-200 italic font-sans">
                    "{word.exampleSentence}"
                  </p>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    {word.exampleTranslation}
                  </p>
                </div>
              </div>

              {/* Trap Tip */}
              {word.etsTrapTip && (
                <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-200/90 font-sans">
                  <strong className="text-amber-300 font-mono uppercase block mb-0.5">💡 Bẫy đề thi:</strong>
                  <p className="leading-relaxed">{word.etsTrapTip}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Interactive Reflex Challenge */}
      {result.interactiveChallenge && (
        <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-850 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              THỬ THÁCH PHẢN XẠ CÔNG SỞ (REFLEX CHALLENGE)
            </h3>
          </div>

          <p className="text-sm font-semibold text-zinc-200 leading-relaxed font-sans">
            {result.interactiveChallenge.prompt}
          </p>

          <div className="grid grid-cols-1 gap-2">
            {shuffledOptions.map((opt: string, idx: number) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === newCorrectIndex;
              let btnStyle = 'bg-zinc-850/60 border-zinc-800 hover:border-zinc-700 text-zinc-200';

              if (hasSubmitted) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500/15 border border-emerald-500/60 text-emerald-200 font-semibold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-500/15 border border-rose-500/60 text-rose-200';
                } else {
                  btnStyle = 'bg-zinc-900/40 border-zinc-850 text-zinc-500';
                }
              } else if (isSelected) {
                btnStyle = 'bg-sky-500/15 border border-sky-500/60 text-white font-medium';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedOption(idx);
                    setHasSubmitted(true);
                  }}
                  className={`p-3.5 rounded-lg border text-left text-xs sm:text-sm transition-all duration-150 flex items-start gap-3 cursor-pointer ${btnStyle}`}
                >
                  <span className="w-5 h-5 rounded-md border border-zinc-700 font-mono flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {hasSubmitted && (
            <div className="p-4 rounded-lg bg-zinc-850/60 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-md ${
                    selectedOption === newCorrectIndex
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {selectedOption === newCorrectIndex
                    ? '✓ CHUẨN XÁC 100%'
                    : '✕ CHƯA TỐI ƯU - XEM PHÂN TÍCH'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                {cleanedExplanation || result.interactiveChallenge.explanation}
              </p>

              {result.interactiveChallenge.takeawayTip && (
                <div className="p-3 rounded-lg bg-sky-950/20 border-l-2 border-l-sky-500 border border-sky-900/30 text-xs text-sky-200 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sky-300 font-mono uppercase">Bí kíp 700+:</strong> {result.interactiveChallenge.takeawayTip}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pronunciation Coach Modal */}
      <PronunciationCoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        target={coachTarget}
      />
    </div>
  );
};
