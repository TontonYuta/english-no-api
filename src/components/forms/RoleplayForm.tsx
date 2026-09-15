import React from 'react';
import {
  MessageSquare,
  Sparkles,
  Users,
  Sliders,
  Shield,
  Bot,
  User,
  Coffee,
  Plane,
  Briefcase,
  Building,
  Handshake,
  UtensilsCrossed,
} from 'lucide-react';
import { DialogueDifficulty, RoleplayLength, Language } from '../../types';
import { translations } from '../../translations';
import { UserSpeechEvaluator } from '../speech/UserSpeechEvaluator';

interface RoleplayFormProps {
  scenario: string;
  setScenario: (val: string) => void;
  userRole: string;
  setUserRole: (val: string) => void;
  aiRole: string;
  setAiRole: (val: string) => void;
  length: RoleplayLength;
  setLength: (val: RoleplayLength) => void;
  difficulty: DialogueDifficulty;
  setDifficulty: (val: DialogueDifficulty) => void;
  onSelectSample: (scenario: string, userRole: string, aiRole: string) => void;
  onStartInstantChat?: (scenario: string, userRole: string, aiRole: string, difficulty: DialogueDifficulty) => void;
  disabled?: boolean;
  lang: Language;
}

export const RoleplayForm: React.FC<RoleplayFormProps> = ({
  scenario,
  setScenario,
  userRole,
  setUserRole,
  aiRole,
  setAiRole,
  length,
  setLength,
  difficulty,
  setDifficulty,
  onSelectSample,
  onStartInstantChat,
  disabled,
  lang,
}) => {
  const t = translations[lang];
  const isVi = lang === 'vi';

  const sampleContacts = [
    {
      icon: Plane,
      title: isVi ? 'Check-in Sân bay' : 'Airport Check-in',
      scenario:
        isVi
          ? 'Quầy làm thủ tục sân bay, hành lý bị quá cân 2.5kg và chỉ còn 25 phút trước giờ lên máy bay'
          : 'Airport check-in counter with 2.5kg overweight baggage and tight boarding cutoff',
      userRole: isVi ? 'Hành khách (Passenger)' : 'Passenger',
      aiRole: isVi ? 'Nhân viên quầy bay (SkyWings Agent)' : 'SkyWings Check-in Agent',
      accent: 'border-l-sky-500',
    },
    {
      icon: Briefcase,
      title: isVi ? 'Phỏng vấn Tech Lead' : 'Tech Job Interview',
      scenario:
        isVi
          ? 'Giải thích giải pháp kiến trúc hệ thống và cách xử lý sự cố máy chủ chịu tải cao'
          : 'Explaining a complex technical challenge and architectural trade-off',
      userRole: isVi ? 'Ứng viên lập trình' : 'Software Engineer Candidate',
      aiRole: isVi ? 'Giám đốc công nghệ (Director)' : 'Engineering Director',
      accent: 'border-l-purple-500',
    },
    {
      icon: Building,
      title: isVi ? 'Khiếu nại Khách sạn' : 'Hotel Complaint',
      scenario:
        isVi
          ? 'Check-in lúc nửa đêm, điều hòa phòng bị hỏng và không có nước nóng'
          : 'Arrived at hotel after midnight to discover AC broken and no hot water',
      userRole: isVi ? 'Khách lưu trú' : 'Hotel Guest',
      aiRole: isVi ? 'Quản lý trực đêm (Duty Manager)' : 'Duty Front Desk Manager',
      accent: 'border-l-amber-500',
    },
    {
      icon: Coffee,
      title: isVi ? 'Quán Cà Phê & Bánh' : 'Coffee Shop Order',
      scenario:
        isVi
          ? 'Gọi đồ uống cà phê đặc biệt, yêu cầu ít đường, sữa hạt yến mạch và xin mật khẩu Wi-Fi'
          : 'Ordering a specialty coffee with oat milk, less sugar, and requesting the Wi-Fi password',
      userRole: isVi ? 'Khách hàng (Customer)' : 'Customer',
      aiRole: isVi ? 'Nhân viên pha chế (Barista)' : 'Artisan Barista',
      accent: 'border-l-emerald-500',
    },
    {
      icon: Handshake,
      title: isVi ? 'Đàm phán Hợp đồng' : 'Contract Negotiation',
      scenario:
        isVi
          ? 'Thương thảo chiết khấu giá 10% theo số lượng và điều khoản gia hạn thanh toán 30 ngày'
          : 'Negotiating a 10% volume discount and 30-day payment term extension',
      userRole: isVi ? 'Trưởng phòng mua hàng (Purchasing Manager)' : 'Purchasing Manager',
      aiRole: isVi ? 'Đại diện nhà cung cấp (Vendor Rep)' : 'Key Account Manager',
      accent: 'border-l-rose-500',
    },
    {
      icon: UtensilsCrossed,
      title: isVi ? 'Đặt bàn Nhà hàng' : 'Fine Dining Reservation',
      scenario:
        isVi
          ? 'Đặt bàn tối 4 người gần cửa sổ cho lễ kỷ niệm, yêu cầu thực đơn không có đậu phộng'
          : 'Reserving a window table for 4 guests for an anniversary, noting a peanut allergy',
      userRole: isVi ? 'Thực khách (Diner)' : 'Diner',
      aiRole: isVi ? 'Quản lý lễ tân (Maitre d\')' : 'Restaurant Maitre d\'',
      accent: 'border-l-indigo-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Active Messenger Waiting State when Automating */}
      {disabled && (
        <div className="p-6 rounded-none bg-neutral-950 border border-neutral-800 border-l-4 border-l-purple-500 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-none bg-gradient-to-br from-purple-800 to-indigo-950 border border-purple-600/60 flex items-center justify-center text-purple-200 font-mono font-black text-sm">
                {(aiRole || 'AI').charAt(0).toUpperCase()}
              </div>
              <span className="w-2.5 h-2.5 rounded-none bg-emerald-400 absolute -bottom-0.5 -right-0.5 border-2 border-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-sans">{aiRole || 'Đối tác'}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-none bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  [LIVE CHAT]
                </span>
              </div>
              <p className="text-xs font-mono text-sky-400 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                <span>
                  {isVi ? 'Đang kết nối & soạn tin nhắn mở đầu...' : 'Connecting & preparing opening dialogue...'}
                </span>
              </p>
            </div>
          </div>

          {/* Typing Indicator Box */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-none space-y-2 max-w-md">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-purple-300">{aiRole || 'Đối tác'}</span>
              <span className="text-[10px] text-sky-400 italic">
                {isVi ? 'Đang soạn tin...' : 'Typing...'}
              </span>
            </div>

            {/* 3 Animated Bouncing Dots */}
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-bounce" />
            </div>

            <p className="text-xs text-neutral-400 font-sans italic leading-relaxed">
              {isVi
                ? `Bên kia đang nhập vai và soạn kịch bản phản xạ cho: "${scenario || 'Cuộc trò chuyện'}"...`
                : `Partner is typing an authentic in-character response for: "${scenario || 'Conversation'}"...`}
            </p>
          </div>
        </div>
      )}

      {/* Instant Live Chat Hero Banner */}
      <div className="p-4 rounded-none bg-gradient-to-r from-purple-950/80 via-neutral-900 to-indigo-950/80 border border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-none bg-purple-900/60 border border-purple-600/70 flex items-center justify-center text-purple-200 shrink-0 shadow-inner">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight">
                {isVi ? 'Hội Thoại Live 1-on-1 với Đối Tác AI' : 'Instant 1-on-1 Live Conversation'}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-none bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold animate-pulse">
                ● ONLINE
              </span>
            </div>
            <p className="text-xs text-neutral-300 font-sans mt-0.5 leading-relaxed">
              {isVi
                ? 'Luyện nói phản xạ trực tiếp qua Micro & Giọng bản xứ Neural TTS, tự động bắt lỗi ngữ pháp thời gian thực.'
                : 'Practice fluent spontaneous speaking with voice recognition and instant Neural TTS partner feedback.'}
            </p>
          </div>
        </div>

        {onStartInstantChat && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onStartInstantChat(scenario, userRole, aiRole, difficulty)}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold uppercase rounded-none border border-purple-400 shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isVi ? 'Bắt Đầu Chat Ngay (0s)' : 'Start Chat Instantly'}</span>
          </button>
        )}
      </div>

      {/* Select Quick Contact Persona */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>{isVi ? 'Danh bạ đối tác trò chuyện (Chọn nhanh):' : 'Chat Partner Personas (Quick Select):'}</span>
          </label>
          <span className="text-[10px] font-mono text-neutral-500">
            {isVi ? 'Bấm để nạp sẵn bối cảnh' : 'Click to load context'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {sampleContacts.map((contact, idx) => {
            const Icon = contact.icon;
            const isSelected = scenario === contact.scenario;

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled}
                onClick={() => onSelectSample(contact.scenario, contact.userRole, contact.aiRole)}
                className={`p-3 text-left rounded-none border transition-all cursor-pointer flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-neutral-900 border-sky-500 border-l-4 text-white shadow-sm'
                    : `bg-neutral-950 hover:bg-neutral-900 border-neutral-800 ${contact.accent} border-l-2 text-neutral-300`
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="p-2 rounded-none bg-neutral-900 border border-neutral-800 shrink-0 text-sky-400 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <div className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                    <span className="truncate">{contact.title}</span>
                    {isSelected && <span className="text-[9px] font-mono text-sky-400 uppercase font-bold">[ĐANG CHỌN]</span>}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 truncate">
                    {contact.aiRole}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Input */}
      <div>
        <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5 flex items-center justify-between">
          <span>{isVi ? 'Bối cảnh cuộc trò chuyện (Scenario):' : 'Chat Scenario & Topic:'}</span>
          <span className="text-[10px] font-mono text-neutral-500 lowercase">
            {isVi ? 'tự do tùy chỉnh tình huống' : 'freeform custom topic'}
          </span>
        </label>
        <input
          id="roleplay-scenario-input"
          type="text"
          disabled={disabled}
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder={t.scenarioPlaceholder}
          className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-none text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors font-sans"
        />
      </div>

      {/* 2-Person Chat Roles Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Role */}
        <div className="p-4 rounded-none bg-neutral-950 border border-neutral-800 space-y-2 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-sky-400">
              <User className="w-4 h-4" />
              <span>{isVi ? 'Vai của bạn (Bên gửi / Phải):' : 'Your Role (Sender / Right):'}</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">[YOU]</span>
          </div>
          <input
            id="roleplay-user-role-input"
            type="text"
            disabled={disabled}
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            placeholder={t.userRolePlaceholder}
            className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-none text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors font-sans"
          />
        </div>

        {/* AI Partner Role */}
        <div className="p-4 rounded-none bg-neutral-950 border border-neutral-800 space-y-2 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-purple-400">
              <Bot className="w-4 h-4" />
              <span>{isVi ? 'Vai của đối tác (Bên nhận / Trái):' : 'Partner Role (Receiver / Left):'}</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">[PARTNER]</span>
          </div>
          <input
            id="roleplay-ai-role-input"
            type="text"
            disabled={disabled}
            value={aiRole}
            onChange={(e) => setAiRole(e.target.value)}
            placeholder={t.aiRolePlaceholder}
            className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-none text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors font-sans"
          />
        </div>
      </div>

      {/* Dialogue Length & CEFR Difficulty Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>{t.dialogueLengthLabel}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'short', label: isVi ? 'Ngắn (4-6 tin)' : 'Short' },
                { id: 'medium', label: isVi ? 'Vừa (6-8 tin)' : 'Medium' },
                { id: 'long', label: isVi ? 'Dài (10-14 tin)' : 'Long' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => setLength(item.id)}
                className={`py-2 px-2 rounded-none text-xs font-mono uppercase font-bold border transition-all text-center ${
                  length === item.id
                    ? 'bg-sky-950 border-sky-500 text-sky-300 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>{t.dialogueDifficultyLabel}</span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(['A2', 'B1', 'B2', 'C1', 'C2'] as DialogueDifficulty[]).map((level) => (
              <button
                key={level}
                type="button"
                disabled={disabled}
                onClick={() => setDifficulty(level)}
                className={`py-2 rounded-none text-xs font-mono font-bold border transition-all text-center ${
                  difficulty === level
                    ? 'bg-purple-950 border-purple-500 text-purple-300 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
