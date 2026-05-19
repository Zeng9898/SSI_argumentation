import { Icon } from '../ui/woodKit';

const STAGES = [
  { id: 1, name: '閱讀小偵探',    icon: 'search'      },
  { id: 2, name: '推理挑戰',      icon: 'psychology'  },
  { id: 3, name: 'AI 論證擂台',   icon: 'forum'       },
  { id: 4, name: '反思整理站',    icon: 'lightbulb'   },
  { id: 5, name: '回顧與推理挑戰', icon: 'replay'      },
];

export default function StageOverviewTab({ currentStage = 1 }: { currentStage?: number }) {
  const CURRENT_STAGE = currentStage;
  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4">
      <h3 className="font-game font-black text-sm sm:text-base text-[#5A3E22] mb-3 flex items-center gap-1.5">
        <Icon name="list_alt" filled className="text-lg text-[#D08B2E]" />
        活動階段
      </h3>
      <div className="space-y-2">
        {STAGES.map((stage) => {
          const isActive = stage.id === CURRENT_STAGE;
          const isPast   = stage.id < CURRENT_STAGE;
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
              <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center
                              text-[10px] sm:text-xs font-game font-black border-2
                ${isActive ? 'bg-[#5C8A2E] border-[#3F6B1E] text-white'
                  : isPast  ? 'bg-[#C19A6B] border-[#8B5E3C] text-white'
                  : 'bg-[#E0D8C8] border-[#C0B8A0] text-[#8B7E6A]'}`}>
                {stage.id}
              </div>
              <Icon name={stage.icon} filled className={`text-base flex-shrink-0
                ${isActive ? 'text-[#3F8B5E]' : isPast ? 'text-[#8B6840]' : 'text-[#B0A090]'}`} />
              <span className={`flex-1 min-w-0 font-game text-xs sm:text-sm font-bold truncate
                ${isActive ? 'text-[#2E5C1A]' : isPast ? 'text-[#7A5232]' : 'text-[#A09080]'}`}>
                {stage.name}
              </span>
              {isActive && (
                <span className="flex-shrink-0 text-[9px] sm:text-[10px] font-game font-black
                                 text-[#3F8B5E] bg-[#5C8A2E]/15 px-1.5 py-0.5 rounded-full
                                 border border-[#5C8A2E]/40 whitespace-nowrap">
                  進行中
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
