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
  AlertCircle,
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
      width: 260,
      margin: 2,
      color: {
        dark: '#09090b',
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
      width: 260,
      margin: 2,
      color: {
        dark: '#09090b',
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

  const isTunnelActive = networkInfo?.tunnel?.active && networkInfo?.tunnel?.url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {lang === 'vi' ? 'Bản Remote Mobile (Quét QR)' : 'Mobile Remote Access (Scan QR)'}
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === 'vi'
                  ? 'Mở điện thoại quét mã để luyện phát âm, flashcard và bài tập bất cứ đâu'
                  : 'Scan QR with your phone to practice speaking, flashcards, and lessons anywhere'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: LAN vs 4G/5G Cloudflare */}
        <div className="px-6 pt-4 pb-2 flex items-center gap-2 border-b border-zinc-850 bg-zinc-950">
          <button
            type="button"
            onClick={() => setActiveTab('lan')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'lan'
                ? 'bg-sky-950/60 border border-sky-500/80 text-sky-300 shadow-sm'
                : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>{lang === 'vi' ? '1. Wi-Fi / LAN Nội Bộ' : '1. Local Wi-Fi / LAN'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tunnel')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'tunnel'
                ? 'bg-amber-950/60 border border-amber-500/80 text-amber-300 shadow-sm'
                : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{lang === 'vi' ? '2. 4G / 5G (Cloudflare Tunnel)' : '2. 4G / 5G (Cloudflare)'}</span>
            {isTunnelActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Target Destination Switcher (Remote Mobile UI vs Full App) */}
        <div className="px-6 py-2.5 bg-zinc-900/40 border-b border-zinc-850 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            {lang === 'vi' ? 'Giao diện đích khi quét:' : 'Destination interface:'}
          </span>
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => setOpenTarget('remote')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                openTarget === 'remote'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              📱 Bản Remote Mobile (Đề xuất)
            </button>
            <button
              type="button"
              onClick={() => setOpenTarget('full')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                openTarget === 'full'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              💻 Toàn Bộ App
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {/* TAB 1: LAN / Wi-Fi */}
          {activeTab === 'lan' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                {/* QR Code Container */}
                <div className="p-3 bg-white rounded-xl shadow-lg shrink-0 flex items-center justify-center">
                  {lanQrDataUrl ? (
                    <img
                      src={lanQrDataUrl}
                      alt="LAN Remote QR Code"
                      className="w-48 h-48 block rounded-md"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-zinc-500 font-mono text-xs">
                      {loading ? 'Đang tạo mã QR...' : 'Chưa có mạng LAN'}
                    </div>
                  )}
                </div>

                {/* Connection info */}
                <div className="flex-1 space-y-3 text-left">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider block font-bold">
                      {lang === 'vi' ? 'Địa chỉ mạng LAN cục bộ:' : 'Local LAN Address:'}
                    </span>
                    <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-white font-bold truncate">
                        {currentLanUrl || 'http://127.0.0.1:3000/remote'}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentLanUrl, 'lan')}
                        className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors shrink-0"
                        title="Sao chép liên kết"
                      >
                        {copied === 'lan' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-400 leading-relaxed font-sans">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>
                        {lang === 'vi'
                          ? 'Mở Camera điện thoại hoặc Zalo quét trực tiếp mã QR ở trên.'
                          : 'Open Phone Camera or QR scanner to open instantly.'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sky-400 font-bold">✓</span>
                      <span>
                        {lang === 'vi'
                          ? 'Đảm bảo điện thoại và máy tính đang kết nối chung mạng Wi-Fi.'
                          : 'Ensure your phone and computer are on the same Wi-Fi.'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={fetchNetworkInfo}
                    className="text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors pt-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>{lang === 'vi' ? 'Làm mới IP mạng' : 'Refresh network info'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 4G / 5G CLOUDFLARE TUNNEL */}
          {activeTab === 'tunnel' && (
            <div className="space-y-4 animate-fade-in">
              {/* Security Banner */}
              <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl flex items-start gap-2.5 text-amber-200 text-xs">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-amber-300 font-bold block mb-0.5">
                    {lang === 'vi'
                      ? 'Đường Hầm Mã Hóa Đầu Cuối (Cloudflare Zero-Trust Tunnel)'
                      : 'End-to-End Encrypted Cloudflare Tunnel'}
                  </strong>
                  {lang === 'vi'
                    ? 'Bảo mật tuyệt đối qua hạ tầng mạng biên Cloudflare toàn cầu. Tự động mã hóa HTTPS TLS 1.3, không để lộ địa chỉ IP nhà riêng và không cần mở cổng modem.'
                    : 'Encrypted via Cloudflare Edge Network. Provides HTTPS TLS 1.3 encryption without opening router ports or exposing home IP.'}
                </div>
              </div>

              {!isTunnelActive ? (
                /* Start Tunnel CTA */
                <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                    <Radio className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      {lang === 'vi' ? 'Đường hầm Cloudflare đang tắt' : 'Cloudflare Tunnel is inactive'}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                      {lang === 'vi'
                        ? 'Nhấn nút bên dưới để tạo ngay liên kết HTTPS bảo mật công khai. Bạn có thể dùng 4G, 5G ở quán café, trên xe buýt hoặc bất cứ đâu.'
                        : 'Click below to launch an instant public HTTPS tunnel to connect via 4G/5G mobile data.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={tunnelStarting}
                    onClick={handleStartTunnel}
                    className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center gap-2 mx-auto cursor-pointer transition-all shadow-md"
                  >
                    <Power className={`w-4 h-4 ${tunnelStarting ? 'animate-spin' : ''}`} />
                    <span>
                      {tunnelStarting
                        ? lang === 'vi'
                          ? 'Đang kết nối Cloudflare...'
                          : 'Connecting to Cloudflare...'
                        : lang === 'vi'
                        ? '🚀 Khởi Động Đường Hầm (1-Click)'
                        : '🚀 Start Cloudflare Tunnel (1-Click)'}
                    </span>
                  </button>

                  {networkInfo?.tunnel?.error && (
                    <p className="text-xs font-mono text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/60">
                      {networkInfo.tunnel.error}
                    </p>
                  )}
                </div>
              ) : (
                /* Tunnel is Active with QR */
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                  {/* QR Code Container */}
                  <div className="p-3 bg-white rounded-xl shadow-lg shrink-0 flex items-center justify-center">
                    {tunnelQrDataUrl ? (
                      <img
                        src={tunnelQrDataUrl}
                        alt="Cloudflare 4G/5G QR Code"
                        className="w-48 h-48 block rounded-md"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-zinc-500 font-mono text-xs">
                        Đang tạo mã QR...
                      </div>
                    )}
                  </div>

                  {/* Connection info */}
                  <div className="flex-1 space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {lang === 'vi' ? 'ĐƯỜNG HẦM ĐANG KẾT NỐI' : 'TUNNEL ACTIVE'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block font-bold">
                        {lang === 'vi' ? 'Liên kết HTTPS Bảo Mật 4G/5G:' : 'Public HTTPS URL (4G/5G):'}
                      </span>
                      <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-white font-bold truncate">
                          {currentTunnelUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(currentTunnelUrl, 'tunnel')}
                          className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors shrink-0"
                          title="Sao chép liên kết"
                        >
                          {copied === 'tunnel' ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-sans">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        {lang === 'vi'
                          ? 'Dùng điện thoại bật 4G/5G quét mã QR là truy cập được ngay.'
                          : 'Connect anytime using 4G/5G cellular data.'}
                      </span>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleStopTunnel}
                        disabled={tunnelStarting}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/80 text-rose-300 hover:text-rose-100 font-mono text-xs font-bold transition-all cursor-pointer"
                      >
                        {lang === 'vi' ? 'Tắt Đường Hầm' : 'Stop Tunnel'}
                      </button>

                      <a
                        href={currentTunnelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{lang === 'vi' ? 'Mở thử tab mới' : 'Test Open'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between font-mono text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Port: <strong className="text-zinc-200">{networkInfo?.port || 3000}</strong></span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg border border-zinc-700 font-bold transition-colors cursor-pointer"
          >
            {lang === 'vi' ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
