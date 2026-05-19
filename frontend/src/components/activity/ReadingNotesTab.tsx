import { Icon } from '../ui/woodKit';
import type { Note } from './NotesPanel';

export default function ReadingNotesTab({ notes }: { notes: Note[] }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-3 sm:px-4 pt-3 pb-2 border-b-2 border-[#C19A6B]/25 flex items-center gap-1.5">
        <Icon name="bookmark" filled className="text-lg text-[#D08B2E]" />
        <h3 className="font-game font-black text-xs sm:text-sm text-[#5A3E22]">閱讀筆記</h3>
        {notes.length > 0 && (
          <span className="text-[10px] font-bold bg-[#F0B962]/30 text-[#7A4A18]
                           px-1.5 py-0.5 rounded-full border border-[#D08B2E]/30">
            {notes.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <Icon name="note" className="text-4xl text-[#D0C5B0]" />
            <p className="text-xs text-[#8B7E6A] font-medium">目前還沒有閱讀筆記。</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notes.map((note) => (
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
