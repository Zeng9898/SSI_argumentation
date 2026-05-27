import { useState } from 'react';
import { WoodIconButton, Icon } from '../components/ui/woodKit';
import StudentSettingsDrawer from '../components/student/StudentSettingsDrawer';
import StageOverviewTab from '../components/activity/StageOverviewTab';
import NotesPanel from '../components/activity/NotesPanel';
import PreviousArgumentsTab from '../components/activity/PreviousArgumentsTab';
import type { Note, Stance } from '../components/activity/NotesPanel';
import type { Message } from '../components/activity/AIChatPanel';
import aiAvatar from '../assets/illustrations/irasutoya_teacher_boy.png';
import studentAvatar from '../assets/illustrations/irasutoya_student_clean.png';
import bgImg from '../assets/backgrounds/bg_chiheisen_green.jpg';
import mascotImg from '../assets/illustrations/scilens_mascot.png';
import settingsIcon from '../assets/icons/settings_wood.png';

type LeftTab = 'overview' | 'notes' | 'myargs';

interface Props {
  notes: Note[];
  onAdd:    (data: { stance: Stance; content: string }) => void;
  onEdit:   (id: string, data: { stance: Stance; content: string }) => void;
  onDelete: (id: string) => void;
  scenarioId: number;
  chatMessages: Message[];
  onBack?: () => void;
  onNextStage?: () => void;
  onLogout?: () => void;
  readOnly?: boolean;
}

export default function AINotesPage({
  notes, onAdd, onEdit, onDelete, scenarioId, chatMessages, onBack, onNextStage, onLogout, readOnly,
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
      <div className="relative z-10 flex-shrink-0 flex items-center justify-between gap-2
                      px-3 sm:px-5 pt-3 sm:pt-4 pb-1 animate-fade-up">
        <WoodIconButton icon="arrow_back" ariaLabel="返回" size="sm" onClick={onBack} />
        <button
          type="button"
          aria-label="設定"
          onClick={() => setSettingsOpen(true)}
          className="hover:rotate-90 hover:scale-110 transition-all duration-500
                     ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer
                     flex items-center justify-center flex-shrink-0
                     drop-shadow-[0_3px_3px_rgba(91,66,38,0.35)]"
        >
          <img src={settingsIcon} alt="設定" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
        </button>
      </div>

      {/* ── Mascot + stage info ──────────────────────────── */}
      <div className="relative z-10 flex-shrink-0 flex items-center gap-3
                      px-4 sm:px-6 py-1 sm:py-1.5 animate-fade-up-delay-1">
        <img
          src={mascotImg}
          alt="吉祥物"
          className="w-12 h-12 sm:w-14 sm:h-14 object-contain animate-breath flex-shrink-0
                     drop-shadow-[0_4px_4px_rgba(91,66,38,0.3)]"
        />
        <div className="leading-tight min-w-0">
          <p className="font-game text-base sm:text-lg font-black text-[#5A3E22]
                        drop-shadow-[0_2px_0_rgba(255,255,255,0.6)]">
            AI 對話筆記整理
          </p>
          <p className="text-xs sm:text-sm font-medium text-[#7A5232] mt-0.5
                        drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] leading-snug
                        line-clamp-2 sm:line-clamp-none">
            回顧剛才與 AI 的對話，整理出你覺得重要的論點與想法，記錄在筆記中。
          </p>
        </div>
      </div>

      {/* ── Main panel ──────────────────────────────────── */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col
                       px-2 sm:px-4 pb-3 sm:pb-4 pt-1.5 animate-fade-up-delay-2">
        {/* Wood outer frame */}
        <div className="flex-1 min-h-0 flex flex-col
                        bg-linear-to-b from-[#C19A6B] to-[#8B5E3C] p-[4px] sm:p-[5px] rounded-[22px]
                        shadow-[0_6px_0_-1px_#5A3E22,0_14px_24px_-6px_rgba(91,66,38,0.45)]">
          {/* Inner cream */}
          <div className="flex-1 min-h-0 flex
                          bg-linear-to-b from-[#FFF8E7] to-[#FBE9C7]
                          rounded-[18px] border-2 border-white/70 overflow-hidden">

            {/* ── Bookmark strip ────────────────────────── */}
            <div className="flex-shrink-0 flex flex-col justify-center gap-2 py-4 px-1
                            bg-[#EDE0C4]/50 border-r-2 border-[#C19A6B]/35 rounded-l-[16px]">
              <BookmarkTab
                label="階段總覽"
                active={leftTab === 'overview'}
                onClick={() => setLeftTab('overview')}
                color="green"
              />
              <BookmarkTab
                label="我的筆記"
                active={leftTab === 'notes'}
                onClick={() => setLeftTab('notes')}
                color="orange"
              />
              <BookmarkTab
                label="我的論點"
                suffixLabel="1"
                active={leftTab === 'myargs'}
                onClick={() => setLeftTab('myargs')}
                color="purple"
              />
            </div>

            {/* ── Left content ──────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden
                            border-r-2 border-[#C19A6B]/25">
              {leftTab === 'overview' && <StageOverviewTab currentStage={3.1} scenarioId={scenarioId} onNextStage={onNextStage} nextStageLabel="進入反思整理站" />}
              {leftTab === 'notes'    && (
                <NotesPanel
                  notes={notes}
                  onAdd={onAdd}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  readOnly={readOnly}
                />
              )}
              {leftTab === 'myargs'   && <PreviousArgumentsTab scenarioId={scenarioId} />}
            </div>

            {/* ── Right: read-only AI chat history ─────── */}
            <div className="w-[42%] sm:w-[44%] flex-shrink-0 flex flex-col min-w-0 overflow-hidden">
              <ChatHistoryPanel messages={chatMessages} />
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

/* ── ChatHistoryPanel (read-only) ─────────────────────── */
function ChatHistoryPanel({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-3 sm:px-4 pt-3 pb-2 border-b-2 border-[#C19A6B]/25
                      flex items-center gap-1.5">
        <Icon name="forum" filled className="text-lg text-[#3A8FCC]" />
        <h3 className="font-game font-black text-xs sm:text-sm text-[#5A3E22] flex-1 min-w-0 truncate">
          AI 論證擂台（紀錄）
        </h3>
        <span className="text-[10px] font-bold bg-[#7BC8F0]/25 text-[#1A5C8A]
                         px-1.5 py-0.5 rounded-full border border-[#3A8FCC]/30 whitespace-nowrap">
          {messages.filter((m) => m.role === 'user').length} 則
        </span>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <Icon name="forum" className="text-4xl text-[#D0C5B0]" />
            <p className="text-xs text-[#8B7E6A] font-medium">還沒有對話紀錄。</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2
                                          ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <img
                src={msg.role === 'ai' ? aiAvatar : studentAvatar}
                alt={msg.role === 'ai' ? 'AI' : '學生'}
                className="shrink-0 w-9 h-9 object-contain drop-shadow-[0_4px_4px_rgba(91,66,38,0.3)]"
              />
              <div className={`max-w-[78%] rounded-2xl px-3 py-2.5 border-2 cursor-default
                ${msg.role === 'ai'
                  ? 'bg-white/80 border-[#C19A6B]/50 rounded-bl-sm'
                  : 'bg-linear-to-br from-[#D8F0C0] to-[#B8E490] border-[#5C8A2E]/60 rounded-br-sm'
                }`}>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'ai' ? 'text-[#5A3E22]' : 'text-[#2E5C1A]'}`}>
                  {msg.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ── BookmarkTab ──────────────────────────────────────── */
function BookmarkTab({ label, suffixLabel, active, onClick, color }: {
  label: string; suffixLabel?: string; active: boolean; onClick: () => void; color: 'green' | 'orange' | 'purple';
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
          <span style={{ textOrientation: 'upright' }}>
            {suffixLabel}
          </span>
        )}
      </span>
    </button>
  );
}
