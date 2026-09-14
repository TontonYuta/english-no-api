import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };
  props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetMemoryAndReload = () => {
    try {
      localStorage.removeItem('playeng_learned_words');
      localStorage.removeItem('playeng_learned_grammar');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-6 rounded-none space-y-4 border-l-4 border-l-rose-500 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-none bg-rose-950 border border-rose-800 text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase tracking-tight text-white font-mono">
                  [ HỆ THỐNG GẶP SỰ CỐ GIAO DIỆN ]
                </h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Ứng dụng đã tự động ngăn chặn tình trạng màn hình trắng (White Screen).
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-none text-xs font-mono text-rose-300 max-h-32 overflow-y-auto">
                {this.state.error.message || 'Lỗi không xác định trong quá trình render.'}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full px-4 py-2.5 rounded-none bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase"
              >
                <RotateCcw className="w-4 h-4" />
                <span>TẢI LẠI TRANG NGAY</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetMemoryAndReload}
                className="w-full px-4 py-2 rounded-none bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-[11px] font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase border border-neutral-700"
              >
                <Home className="w-3.5 h-3.5" />
                <span>ĐẶT LẠI DỮ LIỆU BỘ NHỚ & TẢI LẠI</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
