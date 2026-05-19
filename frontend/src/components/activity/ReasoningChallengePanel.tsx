import { useState } from 'react';
import { Icon } from '../ui/woodKit';

/* ── Types ───────────────────────────────────────────────── */
type Stance = '贊成' | '不贊成';

interface ResponseItem { id: string; text: string; }
interface Counter      { id: string; text: string; responses: ResponseItem[]; }
interface Argument     { id: string; text: string; counters: Counter[]; }

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

/* ── ReasoningChallengePanel ─────────────────────────────── */
export default function ReasoningChallengePanel() {
  const [stance,     setStance]     = useState<Stance | null>(null);
  const [agreeLevel, setAgreeLevel] = useState<number | null>(null);
  const [args,       setArgs]       = useState<Argument[]>([]);
  const [saved,      setSaved]      = useState(false);

  /* ── Q3: arguments ── */
  const addArg    = () => setArgs((p) => [...p, { id: genId(), text: '', counters: [] }]);
  const updateArg = (id: string, text: string) =>
    setArgs((p) => p.map((a) => (a.id === id ? { ...a, text } : a)));
  const deleteArg = (id: string) => setArgs((p) => p.filter((a) => a.id !== id));

  /* ── Q4: counters per argument ── */
  const addCounter = (argId: string) =>
    setArgs((p) => p.map((a) =>
      a.id === argId ? { ...a, counters: [...a.counters, { id: genId(), text: '', responses: [] }] } : a
    ));
  const updateCounter = (argId: string, cId: string, text: string) =>
    setArgs((p) => p.map((a) =>
      a.id === argId ? { ...a, counters: a.counters.map((c) => (c.id === cId ? { ...c, text } : c)) } : a
    ));
  const deleteCounter = (argId: string, cId: string) =>
    setArgs((p) => p.map((a) =>
      a.id === argId ? { ...a, counters: a.counters.filter((c) => c.id !== cId) } : a
    ));

  /* ── Q5: responses per counter ── */
  const addResponse = (argId: string, cId: string) =>
    setArgs((p) => p.map((a) =>
      a.id === argId
        ? { ...a, counters: a.counters.map((c) =>
            c.id === cId ? { ...c, responses: [...c.responses, { id: genId(), text: '' }] } : c
          )}
        : a
    ));
  const updateResponse = (argId: string, cId: string, rId: string, text: string) =>
    setArgs((p) => p.map((a) =>
      a.id === argId
        ? { ...a, counters: a.counters.map((c) =>
            c.id === cId
              ? { ...c, responses: c.responses.map((r) => (r.id === rId ? { ...r, text } : r)) }
              : c
          )}
        : a
    ));
  const deleteResponse = (argId: string, cId: string, rId: string) =>
    setArgs((p) => p.map((a) =>
      a.id === argId
        ? { ...a, counters: a.counters.map((c) =>
            c.id === cId ? { ...c, responses: c.responses.filter((r) => r.id !== rId) } : c
          )}
        : a
    ));

  /* Q5 flattened view: all counters across all arguments */
  const allCounters = args.flatMap((a) => a.counters.map((c) => ({ argId: a.id, counter: c })));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="flex-shrink-0 px-3 sm:px-4 pt-3 pb-2 border-b-2 border-[#C19A6B]/25 flex items-center gap-1.5">
        <Icon name="psychology" filled className="text-xl text-[#D08B2E]" />
        <h3 className="font-game font-black text-xs sm:text-sm text-[#5A3E22]">推理挑戰題目</h3>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3 space-y-4">

        {/* ── Q1 ── */}
        <QuestionBlock num={1} question="你贊成或不贊成「在寫作或工作中，讓生成式 AI 取代文字生產工作」？">
          <div className="flex gap-2">
            {(['贊成', '不贊成'] as Stance[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStance(s)}
                className={`flex-1 py-2 rounded-xl border-2 font-game font-black text-xs sm:text-sm
                           transition-all duration-200 cursor-pointer
                  ${stance === s
                    ? s === '贊成'
                      ? 'bg-[#D8F0C0] border-[#5C8A2E] text-[#2E5C1A] shadow-[0_2px_0_#3F6B1E]'
                      : 'bg-[#FFE0E0] border-[#D03050] text-[#800020] shadow-[0_2px_0_#A02040]'
                    : 'bg-white/60 border-[#C19A6B]/40 text-[#8B7E6A] hover:border-[#C19A6B]'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </QuestionBlock>

        {/* ── Q2 ── */}
        <QuestionBlock num={2} question="你對於「在寫作或工作中，讓生成式 AI 取代文字生產工作」的贊成程度（1 代表非常不贊成，6 代表非常贊成）。">
          <div className="space-y-1.5">
            <div className="flex gap-1 sm:gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAgreeLevel(n)}
                  className={`flex-1 py-2.5 rounded-xl border-2 font-game font-black text-sm
                             transition-all duration-200 cursor-pointer
                    ${agreeLevel === n
                      ? 'bg-linear-to-b from-[#F4D58A] to-[#F0B962] border-[#9B5E18] text-[#7A4A18] shadow-[0_2px_0_#9B5E18] scale-105'
                      : 'bg-white/60 border-[#C19A6B]/40 text-[#8B7E6A] hover:border-[#C19A6B] hover:bg-white/80'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between px-0.5">
              <span className="text-[10px] text-[#9B8878]">非常不贊成</span>
              <span className="text-[10px] text-[#9B8878]">非常贊成</span>
            </div>
          </div>
        </QuestionBlock>

        {/* ── Q3 ── */}
        <QuestionBlock num={3} question="你會提出哪些論點來支持你的立場？">
          <div className="space-y-2">
            {args.map((arg, idx) => (
              <div key={arg.id} className="flex items-center gap-2">
                <IndexBadge n={idx + 1} color="amber" />
                <input
                  type="text"
                  value={arg.text}
                  onChange={(e) => updateArg(arg.id, e.target.value)}
                  placeholder="輸入你的論點..."
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-[#C19A6B]/50 bg-white/80
                             text-xs sm:text-sm text-[#5A3E22] placeholder-[#B0A090]
                             focus:outline-none focus:border-[#D08B2E] focus:bg-white
                             transition-colors duration-200"
                />
                <DeleteBtn onClick={() => deleteArg(arg.id)} />
              </div>
            ))}
            <AddBtn onClick={addArg} label="新增論點" />
          </div>
        </QuestionBlock>

        {/* ── Q4 ── */}
        <QuestionBlock num={4} question="如果有人在這個議題上與你的立場不同，你認為他會提出哪些論點？">
          {args.length === 0 ? (
            <p className="text-xs text-[#9B8878] italic">請先在第 3 題新增論點。</p>
          ) : (
            <div className="space-y-4">
              {args.map((arg) => (
                <div key={arg.id}>
                  <RefLabel prefix="你的論點" text={arg.text || '（尚未填寫）'} />
                  <div className="mt-2 pl-3 border-l-2 border-[#C19A6B]/30 space-y-2">
                    {arg.counters.map((c, idx) => (
                      <div key={c.id} className="flex items-center gap-2">
                        <IndexBadge n={idx + 1} color="red" />
                        <input
                          type="text"
                          value={c.text}
                          onChange={(e) => updateCounter(arg.id, c.id, e.target.value)}
                          placeholder={
                            arg.text
                              ? `針對「${arg.text}」，其他人可能會反駁...`
                              : '其他人可能會反駁...'
                          }
                          className="flex-1 px-3 py-2 rounded-xl border-2 border-[#C19A6B]/50 bg-white/80
                                     text-xs sm:text-sm text-[#5A3E22] placeholder-[#B0A090]
                                     focus:outline-none focus:border-[#D08B2E] focus:bg-white
                                     transition-colors duration-200"
                        />
                        <DeleteBtn onClick={() => deleteCounter(arg.id, c.id)} />
                      </div>
                    ))}
                    <AddBtn onClick={() => addCounter(arg.id)} label="新增反方論點" small />
                  </div>
                </div>
              ))}
            </div>
          )}
        </QuestionBlock>

        {/* ── Q5 ── */}
        <QuestionBlock num={5} question="根據你在第四題所回答的那些論點，你會分別提出哪些論點加以回應？">
          {allCounters.length === 0 ? (
            <p className="text-xs text-[#9B8878] italic">請先在第 4 題新增反方論點。</p>
          ) : (
            <div className="space-y-4">
              {allCounters.map(({ argId, counter }) => (
                <div key={counter.id}>
                  <RefLabel prefix="反方論點" text={counter.text || '（尚未填寫）'} />
                  <div className="mt-2 pl-3 border-l-2 border-[#C19A6B]/30 space-y-2">
                    {counter.responses.map((r, idx) => (
                      <div key={r.id} className="flex items-center gap-2">
                        <IndexBadge n={idx + 1} color="green" />
                        <input
                          type="text"
                          value={r.text}
                          onChange={(e) => updateResponse(argId, counter.id, r.id, e.target.value)}
                          placeholder={
                            counter.text
                              ? `針對「${counter.text}」，你會想要怎麼回應...`
                              : '你會想要怎麼回應...'
                          }
                          className="flex-1 px-3 py-2 rounded-xl border-2 border-[#C19A6B]/50 bg-white/80
                                     text-xs sm:text-sm text-[#5A3E22] placeholder-[#B0A090]
                                     focus:outline-none focus:border-[#D08B2E] focus:bg-white
                                     transition-colors duration-200"
                        />
                        <DeleteBtn onClick={() => deleteResponse(argId, counter.id, r.id)} />
                      </div>
                    ))}
                    <AddBtn onClick={() => addResponse(argId, counter.id)} label="新增回應" small />
                  </div>
                </div>
              ))}
            </div>
          )}
        </QuestionBlock>

        {/* ── Save ── */}
        <div className="pb-4">
          <button
            type="button"
            onClick={handleSave}
            className={`w-full flex items-center justify-center gap-1.5 py-3 rounded-xl
                       border-2 font-game font-black text-xs sm:text-sm
                       transition-all duration-300 cursor-pointer
              ${saved
                ? 'bg-[#D8F0C0] border-[#5C8A2E] text-[#2E5C1A]'
                : 'bg-linear-to-b from-[#F4D58A] to-[#F0B962] border-[#9B5E18] text-[#7A4A18] shadow-[0_3px_0_#9B5E18] hover:shadow-[0_1px_0_#9B5E18] hover:translate-y-0.5'
              }`}
          >
            <Icon name={saved ? 'check_circle' : 'save'} filled className="text-sm" />
            {saved ? '已儲存！' : '儲存'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shared sub-components ───────────────────────────────── */

function QuestionBlock({ num, question, children }: {
  num: number; question: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white/50 border-2 border-[#C19A6B]/30 rounded-2xl p-3">
      <div className="flex gap-2 items-start mb-2.5">
        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                         bg-linear-to-b from-[#F4D58A] to-[#F0B962] border-2 border-[#9B5E18]
                         font-game font-black text-xs text-[#7A4A18] shadow-[0_2px_0_#9B5E18]">
          {num}
        </span>
        <p className="flex-1 pt-0.5 text-xs sm:text-sm font-bold text-[#5A3E22] leading-snug">
          {question}
        </p>
      </div>
      {children}
    </div>
  );
}

function RefLabel({ prefix, text }: { prefix: string; text: string }) {
  return (
    <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F0E8D0]/70 border border-[#C19A6B]/40">
      <span className="shrink-0 text-[10px] font-game font-bold text-[#8B6840] mt-0.5 whitespace-nowrap">
        {prefix}：
      </span>
      <span className="text-[10px] sm:text-xs text-[#5A3E22] leading-snug line-clamp-2">
        「{text}」
      </span>
    </div>
  );
}

function IndexBadge({ n, color }: { n: number; color: 'amber' | 'red' | 'green' }) {
  const cls =
    color === 'amber' ? 'bg-[#F0B962]/40 border-[#D08B2E]/30 text-[#7A4A18]'
    : color === 'red'  ? 'bg-[#FFE0E0]/60 border-[#D03050]/30 text-[#800020]'
    : 'bg-[#D8F0C0]/60 border-[#5C8A2E]/30 text-[#2E5C1A]';
  return (
    <span className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center
                      text-[10px] font-game font-black ${cls}`}>
      {n}
    </span>
  );
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="刪除"
      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                 text-[#B07070] hover:text-[#D03050] hover:bg-[#FFE0E0]
                 transition-colors duration-200 cursor-pointer"
    >
      <Icon name="delete" className="text-sm" />
    </button>
  );
}

function AddBtn({ onClick, label, small = false }: { onClick: () => void; label: string; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 font-game font-bold text-[#5C8A2E]
                  hover:text-[#3F6B1E] transition-colors duration-200 cursor-pointer
                  ${small ? 'text-[10px]' : 'text-xs'}`}
    >
      <Icon name="add_circle" filled className={small ? 'text-sm' : 'text-base'} />
      {label}
    </button>
  );
}
