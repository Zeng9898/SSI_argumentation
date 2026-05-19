import type { ReactNode } from 'react';

/* ── Icon ─────────────────────────────────────────────── */
interface IconProps { name: string; className?: string; filled?: boolean; }
export const Icon = ({ name, className = '', filled = false }: IconProps) => (
  <span className={`material-symbols-rounded${filled ? ' filled' : ''} ${className}`}>{name}</span>
);

/* ── Wood frame class constants ───────────────────────── */
export const WOOD_OUTER =
  'bg-linear-to-b from-[#C19A6B] to-[#8B5E3C] p-[5px] rounded-[28px] ' +
  'shadow-[0_6px_0_-1px_#5A3E22,0_14px_24px_-6px_rgba(91,66,38,0.45)]';

export const WOOD_INNER_CREAM =
  'bg-linear-to-b from-[#FFF8E7] to-[#FBE9C7] rounded-[22px] border-2 border-[#FFFFFF]/70';

/* ── StarRating ───────────────────────────────────────── */
interface StarRatingProps { count?: number; max?: number; size?: string; }
export const StarRating = ({ count = 0, max = 3, size = 'text-xl' }: StarRatingProps) => (
  <div className="inline-flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Icon key={i} name="star" filled
        className={`${size} drop-shadow-[0_2px_0_rgba(180,120,30,0.5)] ${
          i < count ? 'text-[#F4C545]' : 'text-[#D8C7A0]'
        }`}
      />
    ))}
  </div>
);

/* ── WoodIconButton ───────────────────────────────────── */
interface WoodIconButtonProps {
  icon: string;
  onClick?: () => void;
  ariaLabel: string;
  size?: 'sm' | 'md' | 'lg';
  filled?: boolean;
  className?: string;
}
export const WoodIconButton = ({ icon, onClick, ariaLabel, size = 'md', filled = true, className = '' }: WoodIconButtonProps) => {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-base'
    : size === 'lg' ? 'w-12 h-12 text-2xl'
    : 'w-10 h-10 text-xl';
  return (
    <button type="button" aria-label={ariaLabel} onClick={onClick}
      className={`${sizeClass} rounded-full
                 bg-linear-to-b from-[#FFF8E7] to-[#FBE9C7]
                 border-[3px] border-[#8B5E3C] text-[#7A4A18]
                 flex items-center justify-center flex-shrink-0
                 shadow-[0_3px_0_-1px_#5A3E22,0_5px_8px_-2px_rgba(0,0,0,0.3)]
                 hover:scale-110 hover:rotate-12 hover:bg-[#FFF4E0]
                 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer ${className}`}
    >
      <Icon name={icon} filled={filled} />
    </button>
  );
};

/* ── SignBoard ────────────────────────────────────────── */
interface SignBoardProps { children: ReactNode; color?: 'green' | 'blue' | 'orange' | 'tan'; className?: string; }
export const SignBoard = ({ children, color = 'green', className = '' }: SignBoardProps) => {
  const palette = color === 'green'
    ? 'bg-linear-to-b from-[#B8DC83] to-[#7DB044] text-[#2F4A1A] border-[#5C8A2E]'
    : color === 'blue'
      ? 'bg-linear-to-b from-[#86CEF5] to-[#4A9FD8] text-[#1A3A5C] border-[#2E6FA0]'
      : color === 'orange'
        ? 'bg-linear-to-b from-[#F0B962] to-[#D08B2E] text-white border-[#9B5E18]'
        : 'bg-linear-to-b from-[#D8C7A0] to-[#B8A076] text-[#5A3E22] border-[#8B5E3C]';
  return (
    <div className={`relative inline-flex items-center justify-center px-4 py-1 rounded-full border-2 ${palette}
                     shadow-[0_3px_0_-1px_rgba(0,0,0,0.25),0_5px_8px_-3px_rgba(0,0,0,0.3)]
                     font-game text-sm font-bold tracking-wide whitespace-nowrap ${className}`}>
      {children}
    </div>
  );
};
