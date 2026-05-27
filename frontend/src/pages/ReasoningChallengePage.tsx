import { useState } from 'react';
import { WoodIconButton } from '../components/ui/woodKit';
import StudentSettingsDrawer from '../components/student/StudentSettingsDrawer';
import StageOverviewTab from '../components/activity/StageOverviewTab';
import ReadingNotesTab from '../components/activity/ReadingNotesTab';
import type { Note } from '../components/activity/NotesPanel';
import ReasoningChallengePanel from '../components/activity/ReasoningChallengePanel';
import { getScenarioContent } from '../lib/scenarioContent';
import bgImg from '../assets/backgrounds/bg_chiheisen_green.jpg';
import mascotImg from '../assets/illustrations/scilens_mascot.png';
import settingsIcon from '../assets/icons/settings_wood.png';

type LeftTab = 'overview' | 'notes';

interface Props {
  notes: Note[];
  scenarioId: number;
  canEditReasoning?: boolean;
  readOnly?: boolean;
  onBack?: () => void;
  onNextStage?: () => void;
  onLogout?: () => void;
}

export default function ReasoningChallengePage({ notes, scenarioId, canEditReasoning = true, readOnly, onBack, onNextStage, onLogout }: Props) {
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
            推理挑戰
          </p>
          <p className="text-xs sm:text-sm font-medium text-[#7A5232] mt-0.5
                        drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] leading-snug
                        line-clamp-2 sm:line-clamp-none">
            請根據你目前的理解，回答你對這個議題的立場與理由。
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
                label={`階段總覽`}
                active={leftTab === 'overview'}
                onClick={() => setLeftTab('overview')}
                color="green"
              />
              <BookmarkTab
                label={`我的筆記`}
                active={leftTab === 'notes'}
                onClick={() => setLeftTab('notes')}
                color="orange"
              />
            </div>

            {/* ── Left content ──────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden
                            border-r-2 border-[#C19A6B]/25">
              {leftTab === 'overview' && <StageOverviewTab currentStage={2} scenarioId={scenarioId} />}
              {leftTab === 'notes'    && <ReadingNotesTab notes={notes} />}
            </div>

            {/* ── Right: reasoning form ─────────────────── */}
            <div className="w-[42%] sm:w-[44%] flex-shrink-0 flex flex-col min-w-0 overflow-hidden">
              <ReasoningChallengePanel
                scenarioId={scenarioId}
                q1Text={getScenarioContent(scenarioId).q1Text}
                q2Text={getScenarioContent(scenarioId).q2Text}
                onNextStage={onNextStage}
                readOnly={readOnly || !canEditReasoning}
              />
            </div>
          </div>
        </div>
      </main>

      <StudentSettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} onLogout={onLogout ?? (() => {})} />
    </div>
  );
}

/* ── BookmarkTab ──────────────────────────────────────── */
function BookmarkTab({ label, active, onClick, color }: {
  label: string; active: boolean; onClick: () => void; color: 'green' | 'orange';
}) {
  const activeClass = color === 'green'
    ? 'bg-linear-to-b from-[#98D478] to-[#4E9E2E] text-white border-transparent shadow-[0_3px_6px_rgba(78,158,46,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]'
    : 'bg-linear-to-b from-[#F4D58A] to-[#D08B2E] text-white border-transparent shadow-[0_3px_6px_rgba(208,139,46,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]';

  return (
    <button
      type="button"
      onClick={onClick}
      title={label.replace('\n', '')}
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
      </span>
    </button>
  );
}
