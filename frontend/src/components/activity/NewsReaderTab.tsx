import { useState } from 'react';
import { getScenarioContent, type Article } from '../../lib/scenarioContent';

export default function NewsReaderTab({ scenarioId = 1 }: { scenarioId?: number }) {
  const news = getScenarioContent(scenarioId).news;
  const [activeId, setActiveId] = useState<string>(news[0]?.id ?? '');
  const current: Article = news.find((n) => n.id === activeId) ?? news[0];

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex-shrink-0 flex gap-1 px-3 pt-3 border-b-2 border-[#C19A6B]/25 overflow-x-auto">
        {news.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setActiveId(n.id)}
            className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-t-xl text-[11px] sm:text-xs
                        font-game font-bold border-2 border-b-0 transition-all duration-200
                        cursor-pointer whitespace-nowrap
              ${activeId === n.id
                ? 'bg-[#FFF8E7] border-[#C19A6B] text-[#5A3E22] translate-y-[2px]'
                : 'bg-[#EDE0C4]/60 border-[#C19A6B]/40 text-[#8B6840] hover:bg-[#F5EDD8]/80'
              }`}
          >
            {n.tabLabel}
          </button>
        ))}
      </div>

      {/* Article content */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3">
        <h3 className="font-game font-black text-sm sm:text-base text-[#5A3E22] mb-1.5 leading-snug">
          {current.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-3">
          <span className="text-[10px] sm:text-xs font-bold text-[#8B5E3C] bg-[#F0E8D0]
                           px-2 py-0.5 rounded-full border border-[#C19A6B]/50">
            {current.source}
          </span>
          {current.author && (
            <span className="text-[10px] sm:text-xs text-[#7A5232]">{current.author}</span>
          )}
          <span className="text-[10px] sm:text-xs text-[#9B8878]">{current.date}</span>
        </div>

        <div className="space-y-3">
          {current.paragraphs.map((para, i) => (
            <p key={i} className="text-xs sm:text-sm text-[#5A3E22] leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {current.links && (
          <div className="mt-4 pt-3 border-t border-[#C19A6B]/30">
            <p className="text-[10px] sm:text-xs font-bold text-[#8B5E3C] mb-1.5">
              {current.linksLabel ?? '新聞連結'}
            </p>
            <div className="space-y-1">
              {current.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[10px] sm:text-xs text-[#6B8E6B] underline underline-offset-2 hover:text-[#4A6A4A]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
