import React, { useState } from 'react';
import { QuizResult } from '../../types';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface QuizResultViewProps {
  result: QuizResult;
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({ result }) => {
  // Store selected option index per question id: { [questionId]: optionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
    // Auto show explanation once answered
    setShowExplanations((prev) => ({
      ...prev,
      [questionId]: true,
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowExplanations({});
  };

  const totalQuestions = result.questions?.length || 0;
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = result.questions?.reduce((acc, q) => {
    if (selectedAnswers[q.id] === q.correctAnswerIndex) {
      return acc + 1;
    }
    return acc;
  }, 0) || 0;

  const isCompleted = answeredCount === totalQuestions && totalQuestions > 0;

  return (
    <div className="space-y-6">
      {/* Quiz Header & Score Card */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              {result.difficulty || 'Advanced'}
            </span>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs text-neutral-400">
              {answeredCount}/{totalQuestions} Answered
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {result.topic}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {answeredCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-neutral-300">Score:</span>
              <span className="text-sm font-bold text-white">
                {correctCount}/{totalQuestions}
              </span>
            </div>
          )}

          {answeredCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Test</span>
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {result.questions?.map((q, qIndex) => {
          const selected = selectedAnswers[q.id];
          const hasAnswered = selected !== undefined;
          const isCorrect = selected === q.correctAnswerIndex;
          const isExplanationOpen = showExplanations[q.id];

          return (
            <div
              key={q.id}
              id={`quiz-question-${q.id}`}
              className={`p-5 rounded-2xl border transition-all ${
                hasAnswered
                  ? isCorrect
                    ? 'bg-emerald-950/10 border-emerald-900/50'
                    : 'bg-rose-950/10 border-rose-900/50'
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              {/* Question Stem */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-neutral-800 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {qIndex + 1}
                  </span>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {hasAnswered && (
                  <div>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                {q.options?.map((option, optIdx) => {
                  const isThisSelected = selected === optIdx;
                  const isThisCorrect = optIdx === q.correctAnswerIndex;

                  let btnStyle = 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-300';
                  if (hasAnswered) {
                    if (isThisCorrect) {
                      btnStyle = 'bg-emerald-950/40 border-emerald-600 text-emerald-200 font-semibold';
                    } else if (isThisSelected && !isThisCorrect) {
                      btnStyle = 'bg-rose-950/40 border-rose-600 text-rose-300 line-through';
                    } else {
                      btnStyle = 'bg-neutral-950/50 border-neutral-850 text-neutral-500 opacity-60';
                    }
                  }

                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${btnStyle} ${
                        !hasAnswered ? 'cursor-pointer hover:border-sky-500/50' : 'cursor-default'
                      }`}
                    >
                      <span className="font-mono font-bold text-neutral-400">
                        [{letter}]
                      </span>
                      <span className="leading-relaxed flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Grammar Rule */}
              {hasAnswered && (
                <div className="pt-3 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                      Rule: {q.grammarRule}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setShowExplanations((prev) => ({
                          ...prev,
                          [q.id]: !prev[q.id],
                        }))
                      }
                      className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
                    >
                      <span>{isExplanationOpen ? 'Hide analysis' : 'Show analysis'}</span>
                      {isExplanationOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {isExplanationOpen && (
                    <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                      {q.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
