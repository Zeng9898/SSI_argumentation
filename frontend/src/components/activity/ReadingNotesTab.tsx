import { useState } from 'react';
import { Icon } from '../ui/woodKit';
import type { Note, Stance } from './NotesPanel';

const STANCES: Stance[] = ['支持', '反對', '無'];

export default function ReadingNotesTab({ notes }: { notes: Note[] }) {
  const [filter, setFilter] = useState<Stance | null>(null);

  const toggle   = (s: Stance) => setFilter((prev) => (prev === s ? null : s));
  const filtered = filter ? notes.filter((n) => n.stance === filter) : notes;

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-3 sm:px-4 pt-3 pb-2 border-b-2 border-[#C19A6B]/25 flex items-center gap-1.5">
        <Icon name="bookmark" filled className="text-lg text-[#D08B2E]" />
        <h3 className="font-game font-black text-xs sm:text-sm text-[#5A3E22]">閱讀筆記</h3>
        {notes.length > 0 && (
          <span className="text-[10px] font-bold bg-[#F0B962]/30 text-[#7A4A18]
                           px-1.5 py-0.5 rounded-full border border-[#D08B2E]/30">
            {notes.length}
          </span>
        )}
      </div>

      {/* Stance tab bar */}
      {notes.length > 0 && (
        <div className="shrink-0 flex gap-1 px-3 pt-2.5 border-b-2 border-[#C19A6B]/25">
          {STANCES.map((s) => {
            const count = notes.filter((n) => n.stance === s).length;
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggle(s)}
                className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-t-xl
                            text-[11px] sm:text-xs font-game font-bold
                            border-2 border-b-0 transition-all duration-200
                            cursor-pointer whitespace-nowrap
                  ${filter === s
                    ? 'bg-[#FFF8E7] border-[#C19A6B] text-[#5A3E22] translate-y-0.5'
                    : 'bg-[#EDE0C4]/60 border-[#C19A6B]/40 text-[#8B6840] hover:bg-[#F5EDD8]/80'
                  }`}
              >
                {s}
                <span className="ml-1 opacity-60 font-bold">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2.5">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <Icon name="note" className="text-4xl text-[#D0C5B0]" />
            <p className="text-xs text-[#8B7E6A] font-medium">目前還沒有閱讀筆記。</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <Icon name="filter_list" className="text-3xl text-[#D0C5B0]" />
            <p className="text-xs text-[#8B7E6A] font-medium">此類別沒有筆記。</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((note) => (
              <ReadingNoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ReadingNoteCard (read-only) ─────────────────────── */
function ReadingNoteCard({ note }: { note: Note }) {
  const stanceClass =
    note.stance === '支持'  ? 'bg-[#D8F0C0] border-[#5C8A2E] text-[#2E5C1A]'
    : note.stance === '反對' ? 'bg-[#FFE0E0] border-[#D03050] text-[#800020]'
    : 'bg-[#EDE0C4] border-[#8B5E3C] text-[#5A3E22]';

  return (
    <div className="bg-white/80 border-2 border-[#C19A6B]/50 rounded-2xl p-2.5
                    shadow-[0_2px_4px_rgba(91,66,38,0.08)]">
      <div className="mb-1.5">
        <span className={`text-[10px] font-game font-black px-1.5 py-0.5 rounded-full border ${stanceClass}`}>
          {note.stance}
        </span>
      </div>
      <p className="text-xs text-[#5A3E22] leading-relaxed">{note.content}</p>
      <p className="text-[10px] text-[#9B8878] mt-1.5">{note.createdAt}</p>
    </div>
  );
}
