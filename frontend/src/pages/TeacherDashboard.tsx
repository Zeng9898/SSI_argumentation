import { useEffect, useState } from 'react';
import { Icon, WoodIconButton, WOOD_OUTER, WOOD_INNER_CREAM } from '../components/ui/woodKit';
import { useAuth } from '../contexts/AuthContext';
import { api, type Phase, type ClassSetting, type TeacherStudent, type Scenario } from '../lib/api';
import bgImg from '../assets/backgrounds/bg_chiheisen_green.jpg';
import teacherImg from '../assets/illustrations/irasutoya_teacher_boy.png';

const PHASES: { value: Phase; label: string }[] = [
  { value: 'reading',       label: '閱讀偵探' },
  { value: 'reasoning',     label: '推理挑戰' },
  { value: 'argumentation', label: 'AI論證' },
  { value: 'ainotes',       label: 'AI整理' },
  { value: 'reflection',    label: '反思回顧' },
  { value: 'review',        label: '回顧推理' },
  { value: 'completed',     label: '全部完成' },
];

const PHASE_LABEL: Record<string, string> = {
  ...Object.fromEntries(PHASES.map(({ value, label }) => [value, label])),
  pending: '尚未開始',
};

interface Props { onLogout: () => void; }

export default function TeacherDashboard({ onLogout }: Props) {
  const { user } = useAuth();
  const [scenarios,        setScenarios]        = useState<Scenario[]>([]);
  const [scenarioId,       setScenarioId]        = useState<number | null>(null);
  const [classes,          setClasses]           = useState<ClassSetting[]>([]);
  const [expandedClass,    setExpandedClass]     = useState<string | null>(null);
  const [students,         setStudents]          = useState<Record<string, TeacherStudent[]>>({});
  const [loadingStudents,  setLoadingStudents]   = useState<Record<string, boolean>>({});

  // Load scenarios once
  useEffect(() => {
    api.scenarios()
      .then(({ scenarios: list }) => {
        setScenarios(list);
        if (list.length > 0) setScenarioId(list[0].id);
      })
      .catch(console.error);
  }, []);

  // Load class settings when scenario changes
  useEffect(() => {
    if (!scenarioId) return;
    setExpandedClass(null);
    setStudents({});  // 清掉上一個議題的學生快取
    api.teacherClasses(scenarioId).then(({ classes: list }) => setClasses(list)).catch(console.error);
  }, [scenarioId]);

  // Toggle expand / load students for a class
  const toggleClass = async (cls: string) => {
    if (expandedClass === cls) { setExpandedClass(null); return; }
    setExpandedClass(cls);
    if (!students[cls] && scenarioId) {
      setLoadingStudents(prev => ({ ...prev, [cls]: true }));
      try {
        const { students: list } = await api.teacherStudents(cls, scenarioId);
        setStudents(prev => ({ ...prev, [cls]: list }));
      } catch (e) { console.error(e); }
      finally { setLoadingStudents(prev => ({ ...prev, [cls]: false })); }
    }
  };

  const refreshStudents = async (cls: string) => {
    if (!scenarioId) return;
    try {
      const { students: list } = await api.teacherStudents(cls, scenarioId);
      setStudents(prev => ({ ...prev, [cls]: list }));
    } catch (e) { console.error(e); }
  };

  const updateClassPhase = async (cls: string, allowed_phase: Phase) => {
    if (!scenarioId) return;
    setClasses(prev => prev.map(c => c.class === cls ? { ...c, allowed_phase } : c));
    await api.teacherUpdateSettings({ class: cls, scenario_id: scenarioId, allowed_phase }).catch(console.error);
  };

  const updateClassReasoning = async (cls: string, reasoning_editable: boolean) => {
    if (!scenarioId) return;
    setClasses(prev => prev.map(c => c.class === cls ? { ...c, reasoning_editable } : c));
    await api.teacherUpdateSettings({ class: cls, scenario_id: scenarioId, reasoning_editable }).catch(console.error);
  };

  const updateStudentOverride = async (cls: string, userId: number, override: boolean | null) => {
    if (!scenarioId) return;
    await api.teacherUpdateRestriction(userId, scenarioId, override).catch(console.error);
    await refreshStudents(cls);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className={WOOD_OUTER}>
            <div className={`${WOOD_INNER_CREAM} pl-1 pr-3 py-1 flex items-center gap-2`}>
              <img src={teacherImg} alt="教師" className="w-8 h-8 object-contain" />
              <div className="leading-none">
                <p className="font-game text-xs text-[#7A5232]">教師控制台</p>
                <p className="font-game text-base font-bold text-[#5A3E22]">{user?.name ?? ''}</p>
              </div>
            </div>
          </div>

          {/* Scenario selector */}
          {scenarios.length > 1 && (
            <div className={WOOD_OUTER}>
              <div className={`${WOOD_INNER_CREAM} px-3 py-1.5`}>
                <select
                  value={scenarioId ?? ''}
                  onChange={e => setScenarioId(Number(e.target.value))}
                  className="font-game text-sm text-[#5A3E22] bg-transparent outline-none cursor-pointer"
                >
                  {scenarios.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {scenarios.length === 1 && (
            <span className="font-game text-sm font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              {scenarios[0]?.title}
            </span>
          )}
        </div>

        <WoodIconButton icon="logout" ariaLabel="登出" size="sm" onClick={onLogout} />
      </div>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 pb-8 space-y-4">
        {classes.length === 0 && (
          <div className="text-center font-game text-white/80 mt-16 text-sm">
            尚無學生資料，或議題尚未有學生加入。
          </div>
        )}

        {classes.map(cls => (
          <ClassCard
            key={cls.class}
            setting={cls}
            expanded={expandedClass === cls.class}
            students={students[cls.class] ?? null}
            loadingStudents={loadingStudents[cls.class] ?? false}
            onToggle={() => toggleClass(cls.class)}
            onPhaseChange={(phase) => updateClassPhase(cls.class, phase)}
            onReasoningToggle={(val) => updateClassReasoning(cls.class, val)}
            onStudentOverride={(uid, ov) => updateStudentOverride(cls.class, uid, ov)}
          />
        ))}
      </main>
    </div>
  );
}

/* ── ClassCard ─────────────────────────────────────────── */
interface ClassCardProps {
  setting: ClassSetting;
  expanded: boolean;
  students: TeacherStudent[] | null;
  loadingStudents: boolean;
  onToggle: () => void;
  onPhaseChange: (phase: Phase) => void;
  onReasoningToggle: (val: boolean) => void;
  onStudentOverride: (userId: number, override: boolean | null) => void;
}

function ClassCard({ setting, expanded, students, loadingStudents, onToggle, onPhaseChange, onReasoningToggle, onStudentOverride }: ClassCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden
                    shadow-[0_4px_12px_-2px_rgba(91,66,38,0.35)]">
      {/* Class header */}
      <div className="bg-linear-to-b from-[#FFF8E7] to-[#FBE9C7] border-b-2 border-[#C19A6B]/40 px-4 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="font-game font-black text-lg text-[#5A3E22]">{setting.class}</span>
            <Icon
              name={expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              className="text-[#8B6840] group-hover:text-[#5A3E22] transition-colors"
            />
          </button>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Reasoning toggle */}
            <div className="flex items-center gap-2">
              <Icon name="psychology" filled className="text-base text-[#D08B2E]" />
              <span className="font-game text-xs text-[#7A5232]">推理挑戰</span>
              <ToggleSwitch
                value={setting.reasoning_editable}
                onLabel="全班開放"
                offLabel="全班鎖定"
                onChange={onReasoningToggle}
              />
            </div>
          </div>
        </div>

        {/* Phase selector */}
        <div className="mt-3">
          <p className="font-game text-xs text-[#9B8878] mb-1.5">目前開放階段</p>
          <div className="flex flex-wrap gap-1.5">
            {PHASES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onPhaseChange(value)}
                className={`px-2.5 py-1 rounded-xl border-2 font-game font-bold text-xs
                           transition-all duration-200 cursor-pointer
                  ${setting.allowed_phase === value
                    ? 'bg-linear-to-b from-[#98D478] to-[#4E9E2E] border-[#2E6B1A] text-white shadow-[0_2px_0_#1E5010]'
                    : 'bg-white/60 border-[#C19A6B]/40 text-[#8B7E6A] hover:border-[#C19A6B] hover:bg-white/80'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Student list */}
      {expanded && (
        <div className="bg-[#FFF8E7]/90">
          {loadingStudents ? (
            <div className="px-4 py-6 text-center font-game text-xs text-[#9B8878]">載入中…</div>
          ) : !students || students.length === 0 ? (
            <div className="px-4 py-6 text-center font-game text-xs text-[#9B8878]">此班級尚無學生資料</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#C19A6B]/30">
                  <th className="font-game font-bold text-[#7A5232] text-left px-4 py-2">#</th>
                  <th className="font-game font-bold text-[#7A5232] text-left px-2 py-2">姓名</th>
                  <th className="font-game font-bold text-[#7A5232] text-left px-2 py-2 hidden sm:table-cell">帳號</th>
                  <th className="font-game font-bold text-[#7A5232] text-left px-2 py-2">目前階段</th>
                  <th className="font-game font-bold text-[#7A5232] text-center px-2 py-2">推理挑戰（個人）</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => {
                  const effectiveEditable = s.reasoning_override !== null
                    ? s.reasoning_override
                    : setting.reasoning_editable;
                  return (
                    <tr key={s.id} className={`border-b border-[#C19A6B]/20 ${i % 2 === 0 ? '' : 'bg-[#FBE9C7]/40'}`}>
                      <td className="px-4 py-2 font-game text-[#9B8878]">{s.seat_number ?? i + 1}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-game font-bold text-[#5A3E22]">{s.name}</span>
                          {s.reasoning_override !== null && (
                            <span title="個別覆蓋">
                              <Icon name="star" filled className="text-xs text-[#D08B2E]" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 font-game text-[#9B8878] hidden sm:table-cell">{s.account}</td>
                      <td className="px-2 py-2 font-game text-[#5A3E22]">
                        {PHASE_LABEL[s.current_phase] ?? s.current_phase}
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center justify-center gap-1">
                          {/* 有效狀態標籤 */}
                          <span className={`font-game font-bold text-[10px] px-1.5 py-0.5 rounded-lg border
                            ${effectiveEditable
                              ? 'bg-[#D8F0C0] border-[#5C8A2E] text-[#2E5C1A]'
                              : 'bg-[#FFE0E0] border-[#D03050] text-[#800020]'
                            }`}>
                            {effectiveEditable ? '開放' : '鎖定'}
                          </span>
                          {/* 覆蓋操作按鈕 */}
                          <OverrideButtons
                            override={s.reasoning_override}
                            classEditable={setting.reasoning_editable}
                            onChange={(ov) => onStudentOverride(s.id, ov)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

/* ── ToggleSwitch ──────────────────────────────────────── */
function ToggleSwitch({ value, onLabel, offLabel, onChange }: {
  value: boolean; onLabel: string; offLabel: string; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-2 py-0.5 rounded-lg border font-game font-bold text-[10px] cursor-pointer
          transition-all duration-200
          ${value
            ? 'bg-[#D8F0C0] border-[#5C8A2E] text-[#2E5C1A]'
            : 'bg-white/60 border-[#C19A6B]/40 text-[#9B8878] hover:border-[#C19A6B]'
          }`}
      >{onLabel}</button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-2 py-0.5 rounded-lg border font-game font-bold text-[10px] cursor-pointer
          transition-all duration-200
          ${!value
            ? 'bg-[#FFE0E0] border-[#D03050] text-[#800020]'
            : 'bg-white/60 border-[#C19A6B]/40 text-[#9B8878] hover:border-[#C19A6B]'
          }`}
      >{offLabel}</button>
    </div>
  );
}

/* ── OverrideButtons ───────────────────────────────────── */
function OverrideButtons({ override, classEditable, onChange }: {
  override: boolean | null;
  classEditable: boolean;
  onChange: (v: boolean | null) => void;
}) {
  // Three states: null (follow class) | true (force open) | false (force lock)
  return (
    <div className="flex items-center gap-0.5 ml-1">
      <OverrideBtn
        active={override === null}
        label="跟班級"
        color="neutral"
        onClick={() => onChange(null)}
        title={`跟班級設定（目前班級：${classEditable ? '開放' : '鎖定'}）`}
      />
      <OverrideBtn
        active={override === true}
        label="強制開放"
        color="green"
        onClick={() => onChange(true)}
      />
      <OverrideBtn
        active={override === false}
        label="強制鎖定"
        color="red"
        onClick={() => onChange(false)}
      />
    </div>
  );
}

function OverrideBtn({ active, label, color, onClick, title }: {
  active: boolean; label: string; color: 'neutral' | 'green' | 'red';
  onClick: () => void; title?: string;
}) {
  const activeClass =
    color === 'green'   ? 'bg-[#D8F0C0] border-[#5C8A2E] text-[#2E5C1A]'
    : color === 'red'   ? 'bg-[#FFE0E0] border-[#D03050] text-[#800020]'
    : 'bg-[#EDE0C4] border-[#8B6840] text-[#5A3E22]';
  return (
    <button
      type="button"
      title={title ?? label}
      onClick={onClick}
      className={`px-1.5 py-0.5 rounded-md border font-game font-bold text-[9px] cursor-pointer
                  transition-all duration-150
        ${active ? activeClass : 'bg-white/40 border-[#C19A6B]/30 text-[#B0A090] hover:border-[#C19A6B]'}`}
    >
      {label}
    </button>
  );
}
