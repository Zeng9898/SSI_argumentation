import { useState, useRef, useEffect } from 'react';
import { WoodIconButton, Icon } from '../components/ui/woodKit';
import StudentSettingsDrawer from '../components/student/StudentSettingsDrawer';
import StageOverviewTab from '../components/activity/StageOverviewTab';
import NotesPanel from '../components/activity/NotesPanel';
import PreviousArgumentsTab from '../components/activity/PreviousArgumentsTab';
import type { Note, Stance } from '../components/activity/NotesPanel';
import type { Message } from '../components/activity/AIChatPanel';
import { api } from '../lib/api';
import aiAvatar from '../assets/illustrations/irasutoya_teacher_boy.png';
import studentAvatar from '../assets/illustrations/irasutoya_student_clean.png';
import bgImg from '../assets/backgrounds/bg_chiheisen_green.jpg';
import mascotImg from '../assets/illustrations/scilens_mascot.png';
import settingsIcon from '../assets/icons/settings_wood.png';

export const INITIAL_REFLECTION_MESSAGE: Message = {
  id: 'ref0',
  role: 'ai',
  content: '回頭看你和 AI 的討論，在開始論證之前，你原本比較偏向什麼立場？',
};

type LeftTab = 'overview' | 'notes' | 'myargs';

interface Props {
  notes: Note[];
  onAdd:    (data: { stance: Stance; content: string }) => void;
  onEdit:   (id: string, data: { stance: Stance; content: string }) => void;
  onDelete: (id: string) => void;
  scenarioId: number;
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  onBack?: () => void;
  onNextStage?: () => void;
  onLogout?: () => void;
  readOnly?: boolean;
}

export default function ReflectionPage({
  notes, onAdd, onEdit, onDelete, scenarioId,
  messages, onMessagesChange,
  onBack, onNextStage, onLogout, readOnly,
}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leftTab, setLeftTab]           = useState<LeftTab>('overview');

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        height: '100dvh',
        backgroundImage: `url(${bgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* ── Top bar ─────────────────────────────────────── */}
      <div className="relative z-10 shrink-0 flex items-center justify-between gap-2
                      px-3 sm:px-5 pt-3 sm:pt-4 pb-1 animate-fade-up">
        <WoodIconButton icon="arrow_back" ariaLabel="返回" size="sm" onClick={onBack} />
        <button
          type="button"
          aria-label="設定"
          onClick={() => setSettingsOpen(true)}
          className="hover:rotate-90 hover:scale-110 transition-all duration-500
                     ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer
                     flex items-center justify-center shrink-0
                     drop-shadow-[0_3px_3px_rgba(91,66,38,0.35)]"
        >
          <img src={settingsIcon} alt="設定" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
        </button>
      </div>

      {/* ── Mascot + stage info ──────────────────────────── */}
      <div className="relative z-10 shrink-0 flex items-center gap-3
                      px-4 sm:px-6 py-1 sm:py-1.5 animate-fade-up-delay-1">
        <img
          src={mascotImg}
          alt="吉祥物"
          className="w-12 h-12 sm:w-14 sm:h-14 object-contain animate-breath shrink-0
                     drop-shadow-[0_4px_4px_rgba(91,66,38,0.3)]"
        />
        <div className="leading-tight min-w-0">
          <p className="font-game text-base sm:text-lg font-black text-[#5A3E22]
                        drop-shadow-[0_2px_0_rgba(255,255,255,0.6)]">
            反思整理站
          </p>
          <p className="text-xs sm:text-sm font-medium text-[#7A5232] mt-0.5
                        drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] leading-snug
                        line-clamp-2 sm:line-clamp-none">
            請回頭整理剛剛的對話過程，想一想自己在討論時提出了哪些想法、聽到了哪些不同的理由或證據，以及這段對話是否讓你對原本的想法有新的發現或重新思考。
          </p>
        </div>
      </div>

      {/* ── Main panel ──────────────────────────────────── */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col
                       px-2 sm:px-4 pb-3 sm:pb-4 pt-1.5 animate-fade-up-delay-2">
        {/* Wood outer frame */}
        <div className="flex-1 min-h-0 flex flex-col
                        bg-linear-to-b from-[#C19A6B] to-[#8B5E3C] p-1 sm:p-1.25 rounded-[22px]
                        shadow-[0_6px_0_-1px_#5A3E22,0_14px_24px_-6px_rgba(91,66,38,0.45)]">
          {/* Inner cream */}
          <div className="flex-1 min-h-0 flex
                          bg-linear-to-b from-[#FFF8E7] to-[#FBE9C7]
                          rounded-[18px] border-2 border-white/70 overflow-hidden">

            {/* ── Bookmark strip ────────────────────────── */}
            <div className="shrink-0 flex flex-col justify-center gap-2 py-4 px-1
                            bg-[#EDE0C4]/50 border-r-2 border-[#C19A6B]/35 rounded-l-2xl">
              <BookmarkTab label="階段總覽" active={leftTab === 'overview'} onClick={() => setLeftTab('overview')} color="green" />
              <BookmarkTab label="筆記"     active={leftTab === 'notes'}    onClick={() => setLeftTab('notes')}    color="orange" />
              <BookmarkTab label="我的論點" suffixLabel="1" active={leftTab === 'myargs'} onClick={() => setLeftTab('myargs')} color="purple" />
            </div>

            {/* ── Left content ──────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r-2 border-[#C19A6B]/25">
              {leftTab === 'overview' && <StageOverviewTab currentStage={4} scenarioId={scenarioId} onNextStage={onNextStage} nextStageLabel="進入回顧與推理挑戰" />}
              {leftTab === 'notes'    && <NotesPanel notes={notes} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} readOnly={readOnly} />}
              {leftTab === 'myargs'   && <PreviousArgumentsTab scenarioId={scenarioId} />}
            </div>

            {/* ── Right: reflection chat ───────────────── */}
            <div className="w-[42%] sm:w-[44%] shrink-0 flex flex-col min-w-0 overflow-hidden">
              <ReflectionChatPanel scenarioId={scenarioId} messages={messages} onMessagesChange={onMessagesChange} readOnly={readOnly} />
            </div>
          </div>
        </div>
      </main>

      <StudentSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLogout={onLogout ?? (() => {})}
      />
    </div>
  );
}

/* ── ReflectionChatPanel ──────────────────────────────── */
function ReflectionChatPanel({ scenarioId, messages, onMessagesChange, readOnly }: {
  scenarioId: number;
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  readOnly?: boolean;
}) {
  const [input, setInput]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    setIsLoading(true);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const withUser = [...messages, userMsg];
    onMessagesChange(withUser);

    try {
      const { assistantMessage } = await api.sendAiReflection(scenarioId, text);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: assistantMessage };
      onMessagesChange([...withUser, aiMsg]);
    } catch (err) {
      console.error('[ReflectionChatPanel] send error:', err);
      const errMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: '抱歉，發生錯誤，請稍後再試。' };
      onMessagesChange([...withUser, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-3 sm:px-4 pt-3 pb-2 border-b-2 border-[#C19A6B]/25
                      flex items-center gap-1.5">
        <Icon name="lightbulb" filled className="text-lg text-[#C89030]" />
        <h3 className="font-game font-black text-xs sm:text-sm text-[#5A3E22] flex-1 min-w-0 truncate">
          反思聊天室
        </h3>
        <span className="text-[10px] font-bold bg-[#F4D58A]/40 text-[#7A4A18]
                         px-1.5 py-0.5 rounded-full border border-[#C89030]/40 whitespace-nowrap">
          {messages.filter((m) => m.role === 'user').length} 則
        </span>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2
                                        ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <img
              src={msg.role === 'ai' ? aiAvatar : studentAvatar}
              alt={msg.role === 'ai' ? 'AI' : '學生'}
              className="shrink-0 w-9 h-9 object-contain animate-float
                         drop-shadow-[0_4px_4px_rgba(91,66,38,0.3)]"
            />
            <div className={`max-w-[78%] rounded-2xl px-3 py-2.5 border-2
                             transition-all duration-200 hover:-translate-y-0.5 cursor-default
              ${msg.role === 'ai'
                ? 'bg-[#EDE8FF]/80 border-[#C4B0F0]/60 rounded-bl-sm hover:shadow-[0_4px_10px_rgba(150,120,220,0.15)]'
                : 'bg-linear-to-br from-[#FFE8C0] to-[#F4C878] border-[#C89030]/60 rounded-br-sm hover:shadow-[0_4px_10px_rgba(200,144,48,0.22)]'
              }`}>
              <p className={`text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'ai' ? 'text-[#3A2A6A]' : 'text-[#6A4A10]'}`}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {/* Loading bubble */}
        {isLoading && (
          <div className="flex items-end gap-2">
            <img src={aiAvatar} alt="AI" className="shrink-0 w-9 h-9 object-contain animate-float drop-shadow-[0_4px_4px_rgba(91,66,38,0.3)]" />
            <div className="bg-[#EDE8FF]/80 border-2 border-[#C4B0F0]/60 rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#9B80D8] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-[#9B80D8] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-[#9B80D8] rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {!readOnly && <div className="shrink-0 px-3 sm:px-4 py-2.5 border-t-2 border-[#C19A6B]/25 bg-[#EDE0C4]/30">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="分享你的反思…"
            rows={2}
            disabled={isLoading}
            className="flex-1 min-w-0 resize-none
                       bg-white/70 border-2 border-[#C19A6B]/50 rounded-xl
                       px-3 py-2 text-sm text-[#5A3E22] placeholder-[#B0A090]
                       focus:outline-none focus:border-[#C89030]/60 focus:bg-white/90
                       disabled:opacity-60
                       transition-all duration-200 font-game leading-relaxed"
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                       bg-linear-to-b from-[#F4D58A] to-[#D08B2E] text-white
                       shadow-[0_3px_0_#9B5E18] border border-[#C89030]/60
                       hover:from-[#F8DE9A] hover:to-[#E09A3E]
                       active:translate-y-0.5 active:shadow-none
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-150 cursor-pointer"
          >
            <Icon name="send" filled className="text-base" />
          </button>
        </div>
      </div>}
    </div>
  );
}

/* ── BookmarkTab ──────────────────────────────────────── */
function BookmarkTab({ label, suffixLabel, active, onClick, color }: {
  label: string; suffixLabel?: string; active: boolean; onClick: () => void;
  color: 'green' | 'orange' | 'purple';
}) {
  const activeClass =
    color === 'green'  ? 'bg-linear-to-b from-[#98D478] to-[#4E9E2E] text-white border-transparent shadow-[0_3px_6px_rgba(78,158,46,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]'
    : color === 'orange' ? 'bg-linear-to-b from-[#F4D58A] to-[#D08B2E] text-white border-transparent shadow-[0_3px_6px_rgba(208,139,46,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]'
    : 'bg-linear-to-b from-[#C8A8F0] to-[#7B4CC8] text-white border-transparent shadow-[0_3px_6px_rgba(123,76,200,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]';

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`relative flex items-center justify-center
                  w-9 sm:w-10 py-5 rounded-xl border-2 cursor-pointer
                  transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${active
          ? `${activeClass} scale-105`
          : 'bg-white/40 border-[#C19A6B]/30 text-[#8B6840] hover:bg-white/60 hover:scale-105'
        }`}
    >
      <span
        className="font-game font-black text-[10px] sm:text-[11px] leading-tight"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        {label}
        {suffixLabel && (
          <span style={{ textOrientation: 'upright' }}>{suffixLabel}</span>
        )}
      </span>
    </button>
  );
}
