import React from 'react';
import { FlashcardItem } from '../../types';
import { FlashcardDeckView } from './FlashcardDeckView';
import { X, Sparkles } from 'lucide-react';

export interface FlashcardDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: FlashcardItem[];
  title?: string;
  onMemoryUpdated?: () => void;
  lang?: 'vi' | 'en';
}

export const FlashcardDeckModal: React.FC<FlashcardDeckModalProps> = ({
  isOpen,
  onClose,
  items,
  title = 'BỘ THẺ FLASHCARD ÔN TẬP',
  onMemoryUpdated,
  lang = 'vi',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-950 border border-neutral-800 shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-900/90 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              [ 🎴 FLASHCARD DECK • {items.length} TỪ VỰNG ]
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Đóng cửa sổ Flashcard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6">
          <FlashcardDeckView
            items={items}
            title={title}
            onClose={onClose}
            onWordMastered={() => onMemoryUpdated?.()}
            onDeckCompleted={() => onMemoryUpdated?.()}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
};
