import { useState } from 'react';
import { Icon } from '../ui/woodKit';

export type Stance = '支持' | '反對' | '無';

export interface Note {
  id: string;
  stance: Stance;
  content: string;
  createdAt: string;
}

type PanelMode = 'list' | 'add' | 'edit';

interface NotesPanelProps {
  notes: Note[];
  onAdd:    (data: { stance: Stance; content: string }) => void;
  onEdit:   (id: string, data: { stance: Stance; content: string }) => void;
  onDelete: (id: string) => void;
  onNextStage?: () => void;
}

export default function NotesPanel({ notes, onAdd, onEdit, onDelete, onNextStage }: NotesPanelProps) {
  const [mode, setMode]               = useState<PanelMode>('list');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleAdd = (data: { stance: Stance; content: string }) => {
    onAdd(data);
    setMode('list');
  };

  const handleEdit = (data: { stance: Stance; content: string }) => {
    onEdit(editingNote!.id, data);
    setEditingNote(null);
    setMode('list');
  };

  const openEdit   = (note: Note) => { setEditingNote(note); setMode('edit'); };
  const cancelEdit = ()           => { setEditingNote(null); setMode('list'); };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 sm:px-4 pt-3 pb-2
                      border-b-2 border-[#C19A6B]/25">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon name="edit_note" filled className="text-xl text-[#D08B2E] flex-shrink-0" />
          <h3 className="font-game font-black text-xs sm:text-sm text-[#5A3E22] truncate">我的筆記</h3>
          {notes.length > 0 && (
            <span className="flex-shrink-0 text-[10px] font-bold bg-[#F0B962]/30 text-[#7A4A18]
                             px-1.5 py-0.5 rounded-full border border-[#D08B2E]/30">
              {notes.length}
            </span>
          )}
        </div>
        {mode === 'list' ? (
          <button
            type="button"
            onClick={() => setMode('add')}
            className="flex-shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl
                       bg-linear-to-b from-[#F4D58A] to-[#F0B962]
                       border-2 border-[#9B5E18] text-[#7A4A18]
                       font-game font-black text-[10px] sm:text-xs
                       shadow-[0_2px_0_#9B5E18] hover:shadow-[0_1px_0_#9B5E18]
                       hover:translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <Icon name="add" filled className="text-sm" />
            新增
          </button>
        ) : (
          <button
            type="button"
            onClick={cancelEdit}
            className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-xl
                       bg-white border-2 border-[#8B5E3C] text-[#7A4A18]
                       font-game font-black text-[10px] sm:text-xs
                       hover:bg-[#FFF8E7] transition-all duration-200 cursor-pointer"
          >
            <Icon name="close" filled className="text-sm" />
            取消
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3">
        {(mode === 'add' || mode === 'edit') && (
          <NoteEditor
            initial={editingNote}
            onSave={mode === 'edit' ? handleEdit : handleAdd}
            onCancel={cancelEdit}
          />
        )}
        {mode === 'list' && (
          <>
            {notes.length === 0
              ? <EmptyState onAdd={() => setMode('add')} />
              : (
                <div className="space-y-2.5">
                  {notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={() => openEdit(note)}
                      onDelete={() => onDelete(note.id)}
                    />
                  ))}
                </div>
              )
            }
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
                  進入推理挑戰
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── EmptyState ───────────────────────────────────────── */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-2 text-center gap-3">
      <span className="material-symbols-rounded filled text-4xl text-[#D0C5B0]">note_add</span>
      <p className="text-xs text-[#8B7E6A] font-medium leading-snug">
        還沒有筆記喔！<br />閱讀時記下你的想法吧。
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-1 px-3 py-2 rounded-xl
                   bg-linear-to-b from-[#F4D58A] to-[#F0B962]
                   border-2 border-[#9B5E18] text-[#7A4A18]
                   font-game font-black text-xs
                   shadow-[0_2px_0_#9B5E18] hover:shadow-none hover:translate-y-0.5
                   transition-all duration-200 cursor-pointer"
      >
        <Icon name="add" filled className="text-sm" />
        新增第一則筆記
      </button>
    </div>
  );
}

/* ── NoteCard ─────────────────────────────────────────── */
function NoteCard({ note, onEdit, onDelete }: {
  note: { id: string; stance: Stance; content: string; createdAt: string };
  onEdit: () => void;
  onDelete: () => void;
}) {
  const stanceClass = note.stance === '支持'
    ? 'bg-[#D8F0C0] border-[#5C8A2E] text-[#2E5C1A]'
    : note.stance === '反對'
      ? 'bg-[#FFE0E0] border-[#D03050] text-[#800020]'
      : 'bg-[#EDE0C4] border-[#8B5E3C] text-[#5A3E22]';

  return (
    <div
      className="bg-white/80 border-2 border-[#C19A6B]/50 rounded-2xl p-2.5
                 shadow-[0_2px_4px_rgba(91,66,38,0.08)]
                 hover:border-[#C19A6B] hover:shadow-[0_3px_6px_rgba(91,66,38,0.12)]
                 transition-all duration-200 cursor-pointer"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <span className={`flex-shrink-0 text-[10px] font-game font-black px-1.5 py-0.5 rounded-full border ${stanceClass}`}>
          {note.stance}
        </span>
        {/* Stop propagation so delete doesn't trigger edit */}
        <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={onEdit} aria-label="編輯"
            className="w-5 h-5 rounded-md flex items-center justify-center
                       text-[#8B6840] hover:text-[#5A3E22] hover:bg-[#F0E8D0]
                       transition-colors duration-200 cursor-pointer">
            <Icon name="edit" className="text-xs" />
          </button>
          <button type="button" onClick={onDelete} aria-label="刪除"
            className="w-5 h-5 rounded-md flex items-center justify-center
                       text-[#B07070] hover:text-[#D03050] hover:bg-[#FFE0E0]
                       transition-colors duration-200 cursor-pointer">
            <Icon name="delete" className="text-xs" />
          </button>
        </div>
      </div>
      <p className="text-xs text-[#5A3E22] leading-relaxed line-clamp-3">{note.content}</p>
      <p className="text-[10px] text-[#9B8878] mt-1.5">{note.createdAt}</p>
    </div>
  );
}

/* ── NoteEditor ───────────────────────────────────────── */
function NoteEditor({ initial, onSave, onCancel }: {
  initial: { stance: Stance; content: string } | null;
  onSave: (data: { stance: Stance; content: string }) => void;
  onCancel: () => void;
}) {
  const [stance,  setStance]  = useState<Stance>(initial?.stance ?? '無');
  const [content, setContent] = useState(initial?.content ?? '');

  const isEdit = initial !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave({ stance, content: content.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Content */}
      <div>
        <p className="text-[11px] font-bold text-[#7A5232] mb-1.5">筆記內容</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="寫下你的想法、理由或重點..."
          rows={5}
          className="w-full px-3 py-2.5 rounded-xl border-2 border-[#C19A6B]/60 bg-white/80
                     text-xs sm:text-sm text-[#5A3E22] placeholder-[#B0A090]
                     focus:outline-none focus:border-[#D08B2E] focus:bg-white
                     resize-none leading-relaxed transition-colors duration-200"
        />
      </div>

      {/* Stance */}
      <div>
        <p className="text-[11px] font-bold text-[#7A5232] mb-1.5">這則筆記是支持或反對使用生成式 AI 進行創作</p>
        <div className="flex gap-1.5">
          {(['支持', '反對', '無'] as Stance[]).map((s) => {
            const activeClass =
              s === '支持' ? 'bg-[#D8F0C0] border-[#5C8A2E] text-[#2E5C1A] shadow-[0_2px_0_#3F6B1E]'
              : s === '反對' ? 'bg-[#FFE0E0] border-[#D03050] text-[#800020] shadow-[0_2px_0_#A02040]'
              : 'bg-[#EDE0C4] border-[#8B5E3C] text-[#5A3E22] shadow-[0_2px_0_#6B3E1C]';
            const label =
              s === '支持' ? '👍 支持' : s === '反對' ? '👎 反對' : '⬜ 無';
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStance(s)}
                className={`flex-1 py-2 rounded-xl border-2 font-game font-black text-xs sm:text-sm
                           transition-all duration-200 cursor-pointer
                  ${stance === s
                    ? activeClass
                    : 'bg-white/60 border-[#C19A6B]/40 text-[#8B7E6A] hover:border-[#C19A6B]'
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!content.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                     bg-linear-to-b from-[#F4D58A] to-[#F0B962]
                     border-2 border-[#9B5E18] text-[#7A4A18]
                     font-game font-black text-xs sm:text-sm
                     shadow-[0_3px_0_#9B5E18] hover:shadow-[0_1px_0_#9B5E18]
                     hover:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200 cursor-pointer"
        >
          <Icon name="check" filled className="text-sm" />
          {isEdit ? '儲存修改' : '確定新增'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2.5 rounded-xl
                     bg-white border-2 border-[#8B5E3C] text-[#7A4A18]
                     font-game font-black text-xs sm:text-sm
                     hover:bg-[#FFF8E7] transition-all duration-200 cursor-pointer"
        >
          取消
        </button>
      </div>
    </form>
  );
}
