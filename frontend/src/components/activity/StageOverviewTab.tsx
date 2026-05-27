import { Icon } from '../ui/woodKit';
import { getScenarioContent } from '../../lib/scenarioContent';

const STAGES = [
  { id: 1,   label: '1',   name: '閱讀小偵探',        icon: 'search'      },
  { id: 2,   label: '2',   name: '推理挑戰',          icon: 'psychology'  },
  { id: 3,   label: '3',   name: 'AI 論證擂台',       icon: 'forum'       },
  { id: 3.1, label: '3-1', name: 'AI 對話筆記整理',   icon: 'notes'       },
  { id: 4,   label: '4',   name: '反思整理站',         icon: 'lightbulb'   },
  { id: 5,   label: '5',   name: '回顧與推理挑戰',    icon: 'replay'      },
];

interface Props {
  currentStage?: number;
  scenarioId?: number;
  onNextStage?: () => void;
  nextStageLabel?: string;
}

export default function StageOverviewTab({ currentStage = 1, scenarioId = 1, onNextStage, nextStageLabel }: Props) {
  const { topic } = getScenarioContent(scenarioId);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4">
      {/* ── Stage list ─────────────────────────────────── */}
      <h3 className="font-game font-black text-sm sm:text-base text-[#5A3E22] mb-3 flex items-center gap-1.5">
        <Icon name="list_alt" filled className="text-lg text-[#D08B2E]" />
        活動階段
      </h3>
      <div className="space-y-2">
        {STAGES.map((stage) => {
          const isActive = stage.id === currentStage;
          const isPast   = stage.id < currentStage;
          return (
            <div
              key={stage.id}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border-2 transition-all duration-200
                ${isActive
                  ? 'bg-linear-to-r from-[#D8F0C0] to-[#B8E490] border-[#5C8A2E] shadow-[0_3px_0_-1px_#3F6B1E,0_4px_8px_-2px_rgba(92,138,46,0.3)]'
                  : isPast
                    ? 'bg-[#F0EADC]/60 border-[#C19A6B]/30 opacity-70'
                    : 'bg-white/30 border-[#D0C5B0]/30 opacity-50'
                }`}
            >
              <div className={`shrink-0 w-7 h-6 sm:w-8 sm:h-7 rounded-full flex items-center justify-center
                              text-[9px] sm:text-[10px] font-game font-black border-2 px-0.5
                ${isActive ? 'bg-[#5C8A2E] border-[#3F6B1E] text-white'
                  : isPast  ? 'bg-[#C19A6B] border-[#8B5E3C] text-white'
                  : 'bg-[#E0D8C8] border-[#C0B8A0] text-[#8B7E6A]'}`}>
                {stage.label}
              </div>
              <Icon name={stage.icon} filled className={`text-base shrink-0
                ${isActive ? 'text-[#3F8B5E]' : isPast ? 'text-[#8B6840]' : 'text-[#B0A090]'}`} />
              <span className={`flex-1 min-w-0 font-game text-xs sm:text-sm font-bold truncate
                ${isActive ? 'text-[#2E5C1A]' : isPast ? 'text-[#7A5232]' : 'text-[#A09080]'}`}>
                {stage.name}
              </span>
              {isActive && (
                <span className="shrink-0 text-[9px] sm:text-[10px] font-game font-black
                                 text-[#3F8B5E] bg-[#5C8A2E]/15 px-1.5 py-0.5 rounded-full
                                 border border-[#5C8A2E]/40 whitespace-nowrap">
                  進行中
                </span>
              )}
            </div>
          );
        })}
      </div>

      {onNextStage && (
        <div className="mt-4 pt-3 border-t-2 border-[#C19A6B]/25">
          <button
            type="button"
            onClick={onNextStage}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                       bg-linear-to-b from-[#98D478] to-[#4E9E2E]
                       border-2 border-[#3A7820] text-white
                       font-game font-black text-xs sm:text-sm
                       shadow-[0_3px_0_#2A5810] hover:shadow-[0_1px_0_#2A5810]
                       hover:translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <Icon name="arrow_forward" filled className="text-sm" />
            {nextStageLabel ?? '進入下一階段'}
          </button>
        </div>
      )}

      {/* ── Topic panel ────────────────────────────────── */}
      <div className="mt-4 rounded-2xl border-2 border-[#C19A6B]/60 overflow-hidden
                      shadow-[0_3px_8px_-2px_rgba(91,66,38,0.15)]">
        {/* Panel header */}
        <div className="px-3 py-2 bg-linear-to-r from-[#D08B2E] to-[#C07828]
                        flex items-center gap-1.5">
          <Icon name="record_voice_over" filled className="text-base text-white/90 shrink-0" />
          <h4 className="font-game font-black text-xs sm:text-sm text-white leading-tight">
            {topic.title}
          </h4>
        </div>
        {/* Panel body */}
        <div className="px-3 py-2.5 bg-linear-to-b from-[#FFFAF0] to-[#FFF3D8] space-y-2.5">
          <p className="text-[11px] sm:text-xs text-[#5A3E22] leading-relaxed">
            {topic.body}
          </p>
          <div className="bg-[#FFF8E7] border-2 border-[#D08B2E]/40 rounded-xl px-3 py-2
                          flex items-start gap-1.5">
            <Icon name="help" filled className="text-base text-[#D08B2E] shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs font-bold text-[#7A4A18] leading-relaxed">
              {topic.question}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
