import { useEffect, useState } from 'react';
import { Icon, WOOD_OUTER, WOOD_INNER_CREAM, WoodIconButton } from '../components/ui/woodKit';
import TaskCard from '../components/student/TaskCard';
import type { Task } from '../components/student/TaskCard';
import Section from '../components/student/StudentHomeSection';
import StudentSettingsDrawer from '../components/student/StudentSettingsDrawer';
import bgImg from '../assets/backgrounds/bg_chiheisen_green.jpg';
import studentImg from '../assets/illustrations/irasutoya_student_clean.png';
import mascotImg from '../assets/illustrations/scilens_mascot.png';
import settingsIcon from '../assets/icons/settings_wood.png';
import { useAuth } from '../contexts/AuthContext';
import { api, type Scenario } from '../lib/api';

function scenarioToTask(s: Scenario): Task {
  return {
    assignmentId: s.id.toString(),
    taskType: 'scenario',
    quizId: s.id.toString(),
    title: s.title,
    questionCount: 5,
    startDate: s.created_at.slice(0, 10),
    status: s.status === 'completed' ? 'completed' : 'next',
    stars: 0,
    completedAt: s.completed_at,
    bestRecord: null,
  };
}

/* ── StudentHome ──────────────────────────────────────── */
export default function StudentHome({ onBack, onStartActivity }: { onBack?: () => void; onStartActivity?: (scenarioId: number) => void }) {
  const { user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tasks, setTasks]               = useState<Task[]>([]);

  useEffect(() => {
    api.scenarios()
      .then(({ scenarios }) => setTasks(scenarios.map(scenarioToTask)))
      .catch(console.error);
  }, []);

  const handleStart = async (assignmentId: string) => {
    const scenarioId = Number(assignmentId);
    await api.updateActivity(scenarioId, 'reading').catch(console.error);
    onStartActivity?.(scenarioId);
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount   = tasks.length - completedCount;
  const stats = { completedAssignments: completedCount, totalAssignments: tasks.length, pending: pendingCount };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden flex flex-col"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* ── HUD ─────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 pt-3 sm:pt-4 animate-fade-up">
          <div className="flex items-center gap-2 min-w-0">
            <WoodIconButton icon="arrow_back" ariaLabel="返回" size="sm" onClick={onBack} />
            <AvatarPill studentName={user?.name ?? ''} studentClass={user?.class} />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <CombinedStats stats={stats} />
            <button type="button" aria-label="設定" onClick={() => setSettingsOpen(true)}
              className="hover:rotate-90 hover:scale-110 transition-all duration-500
                         ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer
                         flex items-center justify-center flex-shrink-0
                         drop-shadow-[0_3px_3px_rgba(91,66,38,0.35)]">
              <img src={settingsIcon} alt="設定" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
            </button>
          </div>
        </div>

        {/* Mascot message */}
        <div className="flex items-center justify-center gap-3 px-4 sm:px-6 pt-3 pb-3 animate-fade-up-delay-1">
          <img src={mascotImg} alt="吉祥物"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain animate-breath flex-shrink-0
                       drop-shadow-[0_4px_4px_rgba(91,66,38,0.3)]" />
          <div className="leading-tight">
            <p className="font-game text-lg sm:text-xl font-black text-[#5A3E22] drop-shadow-[0_2px_0_rgba(255,255,255,0.6)]">
              你有 <span className="text-[#D08B2E]">{pendingCount}</span> 個任務要挑戰！
            </p>
            <p className="text-sm sm:text-base font-bold text-[#7A5232] mt-1 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
              完成後可在「已完成」區查看你的學習紀錄喔！
            </p>
          </div>
        </div>
      </div>

      {/* ── Main cream panel ──────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col mt-2 animate-fade-up-delay-2">
        <div className="relative flex-1 bg-linear-to-b from-[#FFF8E7] to-[#FBE9C7]
                        rounded-t-[32px] border-t-[3px] border-[#C19A6B]
                        shadow-[0_-4px_12px_-2px_rgba(91,66,38,0.15)]">
          {/* Diagonal stripe overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-t-[32px] opacity-30"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, #F4D58A 0px, #F4D58A 2px, transparent 2px, transparent 16px)' }} />

          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-10">
            <Section title="議題探討" subtitle="與 AI 對話練習科學論證，提升批判力"
              accentColor="#3F8B5E" icon="forum">
              <div className="space-y-3 sm:space-y-4">
                {tasks.map((task) => (
                  <TaskCard key={task.assignmentId} {...task} onStart={() => handleStart(task.assignmentId)} />
                ))}
              </div>
            </Section>
          </div>
        </div>
      </main>

      <StudentSettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} onLogout={onBack ?? (() => {})} />
    </div>
  );
}

/* ── AvatarPill ───────────────────────────────────────── */
function AvatarPill({ studentName, studentClass }: { studentName: string; studentClass?: string | null }) {
  return (
    <div className={`${WOOD_OUTER} flex-shrink-0`}>
      <div className={`${WOOD_INNER_CREAM} pl-1 pr-1 sm:pr-3 py-1 flex items-center gap-1.5`}>
        <img src={studentImg} alt={studentName} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
        <div className="hidden sm:flex flex-col leading-none">
          {studentClass && <p className="font-game text-xs text-[#7A5232]">{studentClass}</p>}
          <p className="font-game text-base sm:text-lg font-bold text-[#5A3E22]">{studentName}</p>
        </div>
      </div>
    </div>
  );
}

/* ── CombinedStats ────────────────────────────────────── */
function CombinedStats({ stats }: { stats: { completedAssignments: number; totalAssignments: number; pending: number } }) {
  const items = [
    { icon: 'check_circle',    value: `${stats.completedAssignments}/${stats.totalAssignments}`, color: 'text-[#5C8A2E]', label: '已完成派題', shortLabel: '已完成' },
    { icon: 'pending_actions', value: stats.pending,                                              color: 'text-[#D08B2E]', label: '待完成派題', shortLabel: '未完成' },
  ];
  return (
    <div className={WOOD_OUTER}>
      <div className={`${WOOD_INNER_CREAM} px-2 py-1 flex items-center divide-x divide-[#C19A6B]/40`}>
        {items.map((item) => (
          <div key={item.icon} title={item.label} className="flex items-center gap-1.5 px-2.5 sm:px-3">
            <Icon name={item.icon} filled className={`text-lg sm:text-xl ${item.color}`} />
            <span className="font-game text-xs text-[#7A5232] leading-none">{item.shortLabel}</span>
            <span className="font-game text-base sm:text-lg font-black text-[#5A3E22] leading-none">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
