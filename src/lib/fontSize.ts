const STORAGE_KEY = 'scilens-font-size';

export const FONT_SIZE_OPTIONS = [
  { value: 'small',  label: '小', px: 14 },
  { value: 'medium', label: '中', px: 16 },
  { value: 'large',  label: '大', px: 18 },
] as const;

export type FontSizeValue = typeof FONT_SIZE_OPTIONS[number]['value'];

export function getFontSize(): FontSizeValue {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as FontSizeValue | null;
    if (v && FONT_SIZE_OPTIONS.some((o) => o.value === v)) return v;
  } catch { /* ignore */ }
  return 'medium';
}

export function applyFontSize(value: FontSizeValue = getFontSize()) {
  const opt = FONT_SIZE_OPTIONS.find((o) => o.value === value) ?? FONT_SIZE_OPTIONS[1];
  document.documentElement.style.fontSize = `${opt.px}px`;
}

export function setFontSize(value: FontSizeValue) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch { /* ignore */ }
  applyFontSize(value);
}
