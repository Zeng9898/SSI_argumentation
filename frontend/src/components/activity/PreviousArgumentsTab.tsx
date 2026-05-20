import { useEffect, useState } from 'react';
import { Icon } from '../ui/woodKit';
import { api } from '../../lib/api';

interface ResponseItem { id: string; text: string; }
interface Counter      { id: string; text: string; responses: ResponseItem[]; }
interface Argument     { id: string; text: string; counters: Counter[]; }

interface Submission {
  stance: '贊成' | '不贊成';
  agreeLevel: number;
  args: Argument[];
}

export default function PreviousArgumentsTab({ scenarioId }: { scenarioId: number }) {
  const [data,    setData]    = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reasoning(scenarioId)
      .then(({ submission }) => { if (submission) setData(submission as Submission); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [scenarioId]);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-3 sm:px-4 pt-3 pb-2 border-b-2 border-[#C19A6B]/25 flex items-center gap-1.5">
        <Icon name="psychology" filled className="text-lg text-[#7B6CC8]" />
        <h3 className="font-game font-black text-xs sm:text-sm text-[#5A3E22]">我之前的論點</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Icon name="hourglass_empty" className="text-3xl text-[#D0C5B0]" />
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Icon name="psychology" className="text-4xl text-[#D0C5B0]" />
            <p className="text-xs text-[#8B7E6A] font-medium">還沒有推理挑戰的紀錄。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* ── 立場 + 贊成程度 ── */}
            <div className="bg-white/60 border-2 border-[#C19A6B]/30 rounded-2xl p-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-game font-bold text-[#8B6840]">我的立場</span>
                <span className={`text-xs font-game font-black px-2 py-0.5 rounded-full border-2
                  ${data.stance === '贊成'
                    ? 'bg-[#D8F0C0] border-[#5C8A2E] text-[#2E5C1A]'
                    : 'bg-[#FFE0E0] border-[#D03050] text-[#800020]'
                  }`}>
                  {data.stance}
                </span>
              </div>
              <div>
                <span className="text-xs font-game font-bold text-[#8B6840] block mb-1.5">贊成程度</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className={`flex-1 h-6 rounded-lg flex items-center justify-center
                                  text-[10px] font-game font-black
                        ${n === data.agreeLevel
                          ? 'bg-linear-to-b from-[#F4D58A] to-[#F0B962] border-2 border-[#9B5E18] text-[#7A4A18]'
                          : n < data.agreeLevel
                            ? 'bg-[#F4D58A]/40 border border-[#D08B2E]/20 text-[#B09060]'
                            : 'bg-white/40 border border-[#C19A6B]/20 text-[#C0B8A0]'
                        }`}
                    >
                      {n}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between px-0.5 mt-1">
                  <span className="text-[10px] text-[#9B8878]">非常不贊成</span>
                  <span className="text-[10px] text-[#9B8878]">非常贊成</span>
                </div>
              </div>
            </div>

            {/* ── 論點列表 ── */}
            {data.args.filter(a => a.text).length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon name="format_list_numbered" filled className="text-base text-[#D08B2E]" />
                  <span className="font-game font-black text-xs sm:text-sm text-[#5A3E22]">我的論點</span>
                </div>
                <div className="space-y-2">
                  {data.args.filter(a => a.text).map((arg, i) => (
                    <div key={arg.id}
                         className="bg-white/60 border-2 border-[#C19A6B]/30 rounded-2xl p-2.5 space-y-2">
                      {/* 論點 */}
                      <div className="flex items-start gap-2">
                        <ArgBadge n={i + 1} color="amber" />
                        <p className="flex-1 min-w-0 text-xs text-[#5A3E22] leading-relaxed pt-0.5">
                          <span className="font-bold">我的論點：</span>{arg.text}
                        </p>
                      </div>

                      {/* 反方論點 */}
                      {arg.counters.filter(c => c.text).length > 0 && (
                        <div className="pl-3 border-l-2 border-[#C19A6B]/30 space-y-2">
                          {arg.counters.filter(c => c.text).map((c, ci) => (
                            <div key={c.id} className="space-y-1.5">
                              <div className="flex items-start gap-1.5">
                                <ArgBadge n={ci + 1} color="red" />
                                <p className="flex-1 min-w-0 text-[11px] text-[#7A3A3A] leading-relaxed pt-0.5">
                                  <span className="font-bold">其他人可能會反駁：</span>{c.text}
                                </p>
                              </div>

                              {/* 回應 */}
                              {c.responses.filter(r => r.text).length > 0 && (
                                <div className="pl-3 border-l-2 border-[#5C8A2E]/20 space-y-1">
                                  {c.responses.filter(r => r.text).map((r, ri) => (
                                    <div key={r.id} className="flex items-start gap-1.5">
                                      <ArgBadge n={ri + 1} color="green" />
                                      <p className="flex-1 min-w-0 text-[11px] text-[#2E5C1A] leading-relaxed pt-0.5">
                                        <span className="font-bold">我會怎麼回應：</span>{r.text}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ArgBadge({ n, color }: { n: number; color: 'amber' | 'red' | 'green' }) {
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
