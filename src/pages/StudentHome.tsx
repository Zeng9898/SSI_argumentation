import { useState } from 'react';
import { Icon, WOOD_OUTER, WOOD_INNER_CREAM, WoodIconButton } from '../components/ui/woodKit';
import TaskCard from '../components/student/TaskCard';
import type { Task } from '../components/student/TaskCard';
import Section from '../components/student/StudentHomeSection';
import StudentSettingsDrawer from '../components/student/StudentSettingsDrawer';
import bgImg from '../assets/backgrounds/bg_chiheisen_green.jpg';
import studentImg from '../assets/illustrations/irasutoya_student_clean.png';
import mascotImg from '../assets/illustrations/scilens_mascot.png';
import settingsIcon from '../assets/icons/settings_wood.png';

/* ── Mock data ────────────────────────────────────────── */
const MOCK_STUDENT_NAME = '林小明';

const MOCK_DIAGNOSIS_PENDING: Task[] = [
  {
    assignmentId: 'a1', taskType: 'diagnosis', quizId: 'q1',
    title: '水溶液基礎診斷', questionCount: 8, dueDate: '2026-05-21',
    status: 'next', stars: 0, completedAt: null, bestRecord: null,
  },
  {
    assignmentId: 'a2', taskType: 'diagnosis', quizId: 'q2',
    title: '溶解度與溫度', questionCount: 6, dueDate: '2026-05-20',
    status: 'next', stars: 0, completedAt: null, bestRecord: null,
  },
];

const MOCK_DIAGNOSIS_COMPLETED: Task[] = [
  {
    assignmentId: 'a3', taskType: 'diagnosis', quizId: 'q3',
    title: '酸鹼指示劑', questionCount: 10, dueDate: '2026-05-10',
    status: 'completed', stars: 2, completedAt: '2026-05-09',
    bestRecord: { correctCount: 7, quizId: 'q3', completedAt: '2026-05-09' },
  },
];

const MOCK_SCENARIO_PENDING: Task[] = [
  {
    assignmentId: 'b1', taskType: 'scenario', quizId: 's1',
    title: '小明的果汁實驗', questionCount: 5, dueDate: '2026-05-23',
    status: 'next', stars: 0, completedAt: null, bestRecord: null,
  },
];

const MOCK_SCENARIO_COMPLETED: Task[] = [
  {
    assignmentId: 'b2', taskType: 'scenario', quizId: 's2',
    title: '海水為什麼是鹹的', questionCount: 4, dueDate: '2026-05-08',
    status: 'completed', stars: 3, completedAt: '2026-05-07',
    bestRecord: { correctCount: 4, quizId: 's2', completedAt: '2026-05-07' },
  },
];

/* ── StudentHome ──────────────────────────────────────── */
export default function StudentHome({ onBack }: { onBack?: () => void }) {
  const [diagnosisHistoryOpen, setDiagnosisHistoryOpen] = useState(false);
  const [scenarioHistoryOpen, setScenarioHistoryOpen]   = useState(false);
  const [settingsOpen, setSettingsOpen]                 = useState(false);

  const totalCompleted = MOCK_DIAGNOSIS_COMPLETED.length + MOCK_SCENARIO_COMPLETED.length;
  const totalAll       = totalCompleted + MOCK_DIAGNOSIS_PENDING.length + MOCK_SCENARIO_PENDING.length;
  const pendingCount   = MOCK_DIAGNOSIS_PENDING.length + MOCK_SCENARIO_PENDING.length;

  const stats = { completedAssignments: totalCompleted, totalAssignments: totalAll, pending: pendingCount };

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
            <AvatarPill studentName={MOCK_STUDENT_NAME} />
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
              完成後可在「已完成」區查看你的學習報告
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
            {/* Diagnosis pending */}
            {MOCK_DIAGNOSIS_PENDING.length > 0 && (
              <Section title="迷思診斷" subtitle="先測驗找出你對科學概念的迷思" accentColor="#D08B2E" icon="quiz">
                <div className="space-y-3 sm:space-y-4">
                  {MOCK_DIAGNOSIS_PENDING.map((task) => (
                    <TaskCard key={task.assignmentId} {...task} onStart={() => {}} />
                  ))}
                </div>
              </Section>
            )}

            {/* Diagnosis completed */}
            {MOCK_DIAGNOSIS_COMPLETED.length > 0 && (
              <Section title="已完成的診斷" count={MOCK_DIAGNOSIS_COMPLETED.length}
                collapsible open={diagnosisHistoryOpen}
                onToggle={() => setDiagnosisHistoryOpen((v) => !v)}
                className="mt-4">
                <div className="space-y-3 sm:space-y-4">
                  {MOCK_DIAGNOSIS_COMPLETED.map((task) => (
                    <TaskCard key={task.assignmentId} {...task} onStart={() => {}} onViewReport={() => {}} />
                  ))}
                </div>
              </Section>
            )}

            {/* Scenario pending */}
            {MOCK_SCENARIO_PENDING.length > 0 && (
              <Section title="情境治療" subtitle="與 AI 對話練習科學論證，治療你的迷思"
                accentColor="#3F8B5E" icon="forum" className="mt-6">
                <div className="space-y-3 sm:space-y-4">
                  {MOCK_SCENARIO_PENDING.map((task) => (
                    <TaskCard key={task.assignmentId} {...task} onStart={() => {}} />
                  ))}
                </div>
              </Section>
            )}

            {/* Scenario completed */}
            {MOCK_SCENARIO_COMPLETED.length > 0 && (
              <Section title="已完成的治療" count={MOCK_SCENARIO_COMPLETED.length}
                collapsible open={scenarioHistoryOpen}
                onToggle={() => setScenarioHistoryOpen((v) => !v)}
                className="mt-4">
                <div className="space-y-3 sm:space-y-4">
                  {MOCK_SCENARIO_COMPLETED.map((task) => (
                    <TaskCard key={task.assignmentId} {...task} onStart={() => {}} onViewReport={() => {}} />
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>
      </main>

      <StudentSettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

/* ── AvatarPill ───────────────────────────────────────── */
function AvatarPill({ studentName }: { studentName: string }) {
  return (
    <div className={`${WOOD_OUTER} flex-shrink-0`}>
      <div className={`${WOOD_INNER_CREAM} pl-1 pr-1 sm:pr-3 py-1 flex items-center gap-1.5`}>
        <img src={studentImg} alt={studentName} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
        <p className="hidden sm:flex font-game text-base sm:text-lg font-bold text-[#5A3E22] items-center leading-none">
          {studentName}
        </p>
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
