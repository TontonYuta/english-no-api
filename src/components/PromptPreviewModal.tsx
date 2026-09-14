import React, { useState } from 'react';
import { X, Copy, Check, Terminal } from 'lucide-react';

interface PromptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  provider: string;
}

export const PromptPreviewModal: React.FC<PromptPreviewModalProps> = ({
  isOpen,
  onClose,
  prompt,
  provider,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-sky-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-800/80 uppercase">
                  [ PROMPT PAYLOAD ]
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Playwright Injection Prompt
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Targeting: <span className="text-sky-300 font-bold uppercase">{provider}</span> web chat interface
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-950 border-y border-zinc-900">
          {prompt}
        </div>

        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>Payload size: <strong className="text-zinc-200 font-mono">{prompt.length}</strong> chars</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg border border-zinc-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
