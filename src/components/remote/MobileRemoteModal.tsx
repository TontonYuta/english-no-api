import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Wifi,
  Radio,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Power,
  ExternalLink,
  Lock,
  Sparkles,
  QrCode,
  ArrowRight,
  Globe,
  Loader2,
} from 'lucide-react';
import QRCode from 'qrcode';

interface NetworkInfo {
  port: number;
  lanIps: string[];
  lanUrl: string;
  remoteLanUrl: string;
  tunnel: {
    active: boolean;
    url: string | null;
    remoteUrl: string | null;
    status: 'idle' | 'starting' | 'active' | 'error' | 'stopped';
    error: string | null;
  };
}

interface MobileRemoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'vi' | 'en';
}

export const MobileRemoteModal: React.FC<MobileRemoteModalProps> = ({
  isOpen,
  onClose,
  lang = 'vi',
}) => {
  const [activeTab, setActiveTab] = useState<'lan' | 'tunnel'>('lan');
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [tunnelStarting, setTunnelStarting] = useState(false);
  const [lanQrDataUrl, setLanQrDataUrl] = useState<string | null>(null);
  const [tunnelQrDataUrl, setTunnelQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [openTarget, setOpenTarget] = useState<'remote' | 'full'>('remote');

  const fetchNetworkInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/network/info');
      if (res.ok) {
        const data: NetworkInfo = await res.json();
        setNetworkInfo(data);
      }
    } catch (err) {
      console.error('Failed to fetch network info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNetworkInfo();
    }
  }, [isOpen]);

  // Generate QR for LAN
  useEffect(() => {
    if (!networkInfo) return;
    const targetUrl = openTarget === 'remote' ? networkInfo.remoteLanUrl : networkInfo.lanUrl;
    if (!targetUrl) return;

    QRCode.toDataURL(targetUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0a0a0c',
        light: '#ffffff',
      },
    })
      .then((url) => setLanQrDataUrl(url))
      .catch((err) => console.error('Failed to generate LAN QR:', err));
  }, [networkInfo, openTarget]);

  // Generate QR for Cloudflare Tunnel
  useEffect(() => {
    if (!networkInfo?.tunnel?.url) {
      setTunnelQrDataUrl(null);
      return;
    }
    const targetUrl =
      openTarget === 'remote'
        ? `${networkInfo.tunnel.url}/remote`
        : networkInfo.tunnel.url;

    QRCode.toDataURL(targetUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0a0a0c',
        light: '#ffffff',
      },
    })
      .then((url) => setTunnelQrDataUrl(url))
      .catch((err) => console.error('Failed to generate Tunnel QR:', err));
  }, [networkInfo?.tunnel?.url, openTarget]);

  const handleStartTunnel = async () => {
    try {
      setTunnelStarting(true);
      const res = await fetch('/api/tunnel/start', { method: 'POST' });
      if (res.ok) {
        await fetchNetworkInfo();
      }
    } catch (err) {
      console.error('Failed to start tunnel:', err);
    } finally {
      setTunnelStarting(false);
    }
  };

  const handleStopTunnel = async () => {
    try {
      setTunnelStarting(true);
      const res = await fetch('/api/tunnel/stop', { method: 'POST' });
      if (res.ok) {
        await fetchNetworkInfo();
      }
    } catch (err) {
      console.error('Failed to stop tunnel:', err);
    } finally {
      setTunnelStarting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isOpen) return null;

  const currentLanUrl = networkInfo
    ? openTarget === 'remote'
      ? networkInfo.remoteLanUrl
      : networkInfo.lanUrl
    : '';

  const currentTunnelUrl = networkInfo?.tunnel?.url
    ? openTarget === 'remote'
      ? `${networkInfo.tunnel.url}/remote`
      : networkInfo.tunnel.url
    : '';

  const isTunnelActive = Boolean(networkInfo?.tunnel?.active && networkInfo?.tunnel?.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Sleek Top Header */}
        <div className="px-5 py-4 border-b border-zinc-850 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {lang === 'vi' ? 'Quét QR Kết Nối Điện Thoại' : 'Connect Phone via QR Code'}
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                {lang === 'vi'
                  ? 'Luyện phát âm & Flashcard một tay mượt mà trên smartphone'
                  : 'Practice speech & flashcards on your mobile device'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Segmented Modern Control */}
        <div className="p-3 bg-zinc-950 border-b border-zinc-850">
          <div className="grid grid-cols-2 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('lan')}
              className={`py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'lan'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Wifi className={`w-3.5 h-3.5 ${activeTab === 'lan' ? 'text-sky-400' : ''}`} />
              <span>Wi-Fi / LAN Nội Bộ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tunnel')}
              className={`py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'tunnel'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${activeTab === 'tunnel' ? 'text-amber-400' : ''}`} />
              <span>4G / 5G Cloudflare</span>
              {isTunnelActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 overflow-y-auto max-h-[65vh] space-y-4">
          {/* TAB 1: LAN / Wi-Fi */}
          {activeTab === 'lan' && (
            <div className="space-y-4 animate-fade-in text-center">
              {/* QR Code Presentation Box */}
              <div className="relative inline-block mx-auto">
                <div className="p-4 bg-white rounded-2xl shadow-xl shadow-sky-500/5 border-4 border-zinc-800/60 inline-flex flex-col items-center justify-center">
                  {lanQrDataUrl ? (
                    <img
                      src={lanQrDataUrl}
                      alt="LAN Remote QR Code"
                      className="w-48 h-48 sm:w-52 sm:h-52 block rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-zinc-500 font-mono text-xs">
                      <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                    </div>
                  )}
                  <div className="mt-2 text-[10px] font-mono font-bold text-zinc-800 tracking-wider flex items-center gap-1 uppercase">
                    <Wifi className="w-3 h-3 text-sky-600" />
                    <span>MẠNG WI-FI NỘI BỘ</span>
                  </div>
                </div>
              </div>

              {/* URL & Action Bar */}
              <div className="space-y-2 text-left">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">
                  {lang === 'vi' ? 'Đường dẫn kết nối điện thoại:' : 'Mobile Connection URL:'}
                </span>

                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-2 shadow-inner">
                  <span className="text-xs font-mono text-sky-300 font-bold truncate">
                    {currentLanUrl || 'http://127.0.0.1:3000/remote'}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentLanUrl, 'lan')}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Sao chép"
                    >
                      {copied === 'lan' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>

                    <a
                      href={currentLanUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Mở tab mới trên máy tính"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* 2-Step Quick Guide */}
              <div className="grid grid-cols-2 gap-2 text-left pt-1">
                <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-850 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-mono">
                      1
                    </span>
                    <span>Cùng Wi-Fi</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                    Điện thoại và máy tính kết nối chung mạng Wi-Fi.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-850 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-mono">
                      2
                    </span>
                    <span>Quét mã QR</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                    Dùng Camera hoặc Zalo quét mã là vào học ngay.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 4G / 5G CLOUDFLARE TUNNEL */}
          {activeTab === 'tunnel' && (
            <div className="space-y-4 animate-fade-in text-center">
              {/* Security Badge Card */}
              <div className="p-3 bg-amber-950/25 border border-amber-800/40 rounded-xl text-left flex items-start gap-2.5 text-amber-200 text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-sans">
                  <strong className="text-amber-300 font-bold block mb-0.5">
                    Đường Hầm Cloudflare Tunnel (Bảo Mật Tuyệt Đối)
                  </strong>
                  Mã hóa HTTPS TLS 1.3 qua mạng biên toàn cầu của Cloudflare. Không để lộ IP nhà, không cần mở port modem, truy cập mọi lúc mọi nơi bằng mạng 4G/5G.
                </div>
              </div>

              {!isTunnelActive ? (
                /* Inactive State: CTA to start tunnel */
                <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                    <Radio className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Đường hầm Cloudflare đang tắt
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-sans">
                      Bấm nút dưới đây để tạo liên kết HTTPS bảo mật công khai, sẵn sàng quét QR khi dùng 4G hoặc 5G.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={tunnelStarting}
                    onClick={handleStartTunnel}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-mono text-xs font-black flex items-center gap-2 mx-auto cursor-pointer transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
                  >
                    {tunnelStarting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                        <span>Đang kết nối Cloudflare...</span>
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 text-zinc-950" />
                        <span>🚀 Bật Đường Hầm Cloudflare (1-Click)</span>
                      </>
                    )}
                  </button>

                  {networkInfo?.tunnel?.error && (
                    <p className="text-xs font-mono text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/60">
                      {networkInfo.tunnel.error}
                    </p>
                  )}
                </div>
              ) : (
                /* Active Tunnel with QR Code */
                <div className="space-y-4">
                  <div className="relative inline-block mx-auto">
                    <div className="p-4 bg-white rounded-2xl shadow-xl shadow-amber-500/5 border-4 border-zinc-800/60 inline-flex flex-col items-center justify-center">
                      {tunnelQrDataUrl ? (
                        <img
                          src={tunnelQrDataUrl}
                          alt="Cloudflare 4G/5G QR Code"
                          className="w-48 h-48 sm:w-52 sm:h-52 block rounded-lg"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-zinc-500 font-mono text-xs">
                          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                        </div>
                      )}
                      <div className="mt-2 text-[10px] font-mono font-bold text-zinc-800 tracking-wider flex items-center gap-1 uppercase">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>CLOUDFLARE 4G/5G HTTPS</span>
                      </div>
                    </div>
                  </div>

                  {/* URL & Action Bar */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">
                        Liên kết Cloudflare công khai:
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Đang truyền phát
                      </span>
                    </div>

                    <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-2 shadow-inner">
                      <span className="text-xs font-mono text-amber-300 font-bold truncate">
                        {currentTunnelUrl}
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(currentTunnelUrl, 'tunnel')}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Sao chép"
                        >
                          {copied === 'tunnel' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>

                        <a
                          href={currentTunnelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Mở tab mới trên máy tính"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleStopTunnel}
                        disabled={tunnelStarting}
                        className="text-xs font-mono text-rose-400 hover:text-rose-300 py-1 px-2.5 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        [ Tắt đường hầm ]
                      </button>

                      <span className="text-[11px] font-sans text-zinc-400">
                        Bật 4G/5G trên điện thoại và quét QR để vào học.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Destination Interface Mode Picker */}
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-850 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-medium">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Giao diện khi quét:</span>
            </div>

            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setOpenTarget('remote')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  openTarget === 'remote'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                📱 Bản Mobile Gọn
              </button>
              <button
                type="button"
                onClick={() => setOpenTarget('full')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  openTarget === 'full'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                💻 Toàn Bộ App
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-850 bg-zinc-900/40 flex items-center justify-between font-mono text-xs text-zinc-400">
          <span className="flex items-center gap-1 text-[11px]">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span>Port: {networkInfo?.port || 3000}</span>
          </span>

          <div className="flex items-center gap-2">
            <a
              href="/remote"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-750 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Xem thử Remote</span>
              <ArrowRight className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
