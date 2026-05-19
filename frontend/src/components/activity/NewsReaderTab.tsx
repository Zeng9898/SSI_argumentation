import { useState } from 'react';

interface Article {
  id: string;
  tabLabel: string;
  title: string;
  source: string;
  author?: string;
  date: string;
  paragraphs: string[];
  links?: { label: string; url: string }[];
  linksLabel?: string;
}

const NEWS: Article[] = [
  {
    id: 'news1',
    tabLabel: '芥川賞事件',
    title: 'AI幫忙寫小說，得獎後引發討論',
    source: 'Openbook閱讀誌',
    author: '蕭詒徽',
    date: '2025年03月06日',
    paragraphs: [
      '2024年，日本作家九段理江以小說《東京都同情塔》獲得芥川賞。後來她在記者會上表示，作品中有一小部分文字是和生成式AI對話後直接引用的，這件事立刻引起很多討論。',
      '有些人認為，既然小說整體的構想、主題和大部分內容仍然來自作者本人，適度使用AI不一定有問題；但也有人擔心，如果作品中有AI參與，會不會影響大家對「創作」和「公平」的看法。',
      '這部小說特別的地方在於，AI並不只是幕後工具，而是作品主題的一部分。書中刻意把AI的語句和人類角色的語句區分開來，讓讀者能感受到兩種不同的聲音一起出現在故事中。這也讓大家開始思考：如果AI也能寫出很像人類的句子，那人類創作最重要的地方到底是什麼？',
      '九段理江後來表示，AI可以生成文字，但真正想要寫作、想要表達、想和世界對話的那種衝動，還是來自人類。有人因此認為，這次事件真正值得討論的，不只是「有沒有使用AI」，而是「作者怎麼使用AI」，以及作品的核心想法是不是仍然來自人類自己。',
      '這個事件讓更多人開始討論：在文學創作中，AI可以扮演什麼角色？如果作品的一小部分由AI幫忙完成，這樣算不算創作？不同的人可能會有不同看法，而這些不同意見，也成為今天大家思考AI與創作關係的重要例子。',
    ],
    links: [
      { label: 'Facebook 貼文', url: 'https://www.facebook.com/share/p/1GM8PviZgd/' },
      { label: 'Openbook 閱讀誌原文', url: 'https://www.openbook.org.tw/article/p-70568' },
    ],
  },
  {
    id: 'news2',
    tabLabel: '假書推薦',
    title: 'AI參與寫作後，可能出現看起來很真、其實是假的內容',
    source: 'AP News',
    author: 'David Bauder',
    date: '2025年05月22日',
    paragraphs: [
      '美國有一份報紙的夏季特刊，原本想推薦適合暑假閱讀的好書，卻發生了一件令人意外的事：書單中除了真正存在的小說，也出現了好幾本其實根本不存在的「假書」。',
      '負責撰寫這份暑假閱讀推薦書單的人，後來承認，自己在找資料時使用了人工智慧幫忙，但沒有仔細檢查內容是否正確。結果，AI產出的資料裡有許多假的書名、假的故事介紹，甚至還配上真實作家的名字，讓人看起來很像真的。',
      '例如，書單中提到一本叫做《The Last Algorithm》的書，說是作家Andy Weir寫的；還有一本叫做《Nightshade Market》的書，說是作家Min Jin Lee寫的。這些作家都是真實存在的人，可是這兩本書其實根本不存在。後來，Min Jin Lee也公開表示，自己從來沒有寫過這本書。',
      '這件事被發現後，提供這份內容的公司表示，已經解僱這位作者。刊登這份特刊的報社也說，正在調查裡面是不是還有其他錯誤內容，並且已經把數位版本下架。報社也強調，新聞和出版工作不能只靠科技，還需要人的查證、判斷和負責任的態度。',
      '這不是媒體第一次因為使用AI而發生錯誤。以前也有其他媒體因為太快相信AI產出的內容，結果出現假作者、錯誤報導或不正確的資料。這些事件提醒大家，AI雖然可以幫助整理資訊、加快工作速度，但它有時也會產生看起來很像真的、其實卻是錯的內容。',
      '因此，使用AI時不能只看表面，還需要再次查證，確認資料是否正確。對媒體、作家和讀者來說，這件事都提醒大家：當我們閱讀或使用AI產出的內容時，必須更小心分辨真假，才能避免被錯誤資訊誤導。',
    ],
    links: [
      { label: 'AP News, Newspaper\'s summer book list recommends nonexistent books thanks to AI.', url: 'https://apnews.com/article/fake-book-list-ai-newspaper-summer-reading-fcdf454a5b467dad3adfed6ca1a224d2' },
    ],
  },
  {
    id: 'news3',
    tabLabel: 'AI與工作',
    title: 'AI可能改變工作內容，也可能影響工作機會',
    source: 'Reuters',
    author: 'Akash Sriram、Harshita Mary Varghese（編輯：Alan Barona）',
    date: '2025年07月19日',
    paragraphs: [
      'Amazon執行長Andy Jassy表示，隨著生成式AI和AI助理越來越常被用在公司工作裡，未來幾年公司中的一些工作方式可能會改變，某些職位的人數也可能減少。',
      '報導提到，現在AI已經開始幫助公司完成一些重複性高、比較固定的工作，例如整理資料、協助客服、改進商品頁面內容，以及幫助預測庫存和出貨需求。Amazon認為，這些工具可以提高工作效率，也能改善顧客使用服務的經驗。',
      'Andy Jassy在給員工的信中說，當公司使用更多生成式AI和AI助理後，有些原本需要很多人做的工作，未來可能不再需要那麼多人；但同時，也會出現新的工作內容和新的職位需求。這表示，AI不一定只是「取代人」，也可能讓工作方式重新分配和改變。',
      '報導也指出，這種情況不只發生在Amazon。其他科技公司也在使用AI來提高工作效率，特別是在寫程式、整理內容和內部工作流程上。有人認為，AI可以幫助人們節省時間，把更多精力放在更需要思考的事情上；但也有人擔心，如果公司越來越依賴AI，某些工作機會可能會減少，員工也需要學習新的能力。',
      '專家認為，AI未必會讓大量的人完全失去工作，但可能會讓一些工作內容改變，或讓某些職位減少、某些職位增加。這也提醒大家，當AI被用在工作中時，人們除了要了解AI能幫忙做什麼，也要思考哪些事情仍然需要人的判斷、創意和責任。',
      '因此，AI進入工作現場，可能帶來方便，也可能帶來挑戰。對公司來說，AI可以提高效率；對員工來說，則需要重新思考未來的工作方式，以及自己還需要培養哪些新的能力。',
    ],
    links: [
      { label: 'Reuters 原文', url: 'https://www.reuters.com/business/retail-consumer/amazons-workforce-reduce-rollout-generative-ai-agents-2025-06-17/' },
    ],
  },
  {
    id: 'news4',
    tabLabel: 'UNESCO',
    title: '生成式AI可以幫忙生成文字，但不能完全代替人的思考',
    source: '聯合國教科文組織（UNESCO）',
    date: '2023年',
    paragraphs: [
      '聯合國教科文組織（UNESCO）指出，生成式AI可以依照人的指令快速產生文字、圖片、影片和音樂。它看起來很會寫，也能很快完成文章內容，所以有些人會用它來幫忙寫作或工作。可是，UNESCO也提醒大家，AI產生的內容雖然常常看起來很合理，卻不一定正確，有時還會出現錯誤、捏造的資訊，或帶有偏見的說法。',
      'UNESCO認為，AI可以成為幫助人類的工具，但不應該取代人的思考。如果人們太依賴AI來寫作、整理內容或表達想法，可能會減少自己練習思考、判斷和表達的機會，影響原本應該慢慢培養的能力。尤其是學生，如果沒有仔細檢查，就直接相信AI產生的內容，可能會學到不正確的資訊。',
      '另外，UNESCO也提醒，AI的內容大多來自網路上的大量資料，這些資料可能沒有經過原作者同意，也可能只代表某些常見的觀點，忽略其他不同的聲音。所以，當我們使用AI來幫忙寫作時，不能只看它寫得快不快、順不順，還要去想：內容是否正確？理由是否可靠？這些文字能不能真正代表自己的想法？',
      '因此，AI可以幫助人類工作，但真正重要的判斷、查證和負責，還是需要人自己來完成。',
    ],
    linksLabel: '參考資料',
    links: [
      { label: 'United Nations Educational, Scientific and Cultural Organization. (2023). Guidance for generative AI in education and research. UNESCO. https://doi.org/10.54675/EWZM9535', url: 'https://doi.org/10.54675/EWZM9535' },
    ],
  },
];

export default function NewsReaderTab() {
  const [activeId, setActiveId] = useState(NEWS[0].id);
  const current = NEWS.find((n) => n.id === activeId) ?? NEWS[0];

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex-shrink-0 flex gap-1 px-3 pt-3 border-b-2 border-[#C19A6B]/25 overflow-x-auto">
        {NEWS.map((news) => (
          <button
            key={news.id}
            type="button"
            onClick={() => setActiveId(news.id)}
            className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-t-xl text-[11px] sm:text-xs
                        font-game font-bold border-2 border-b-0 transition-all duration-200
                        cursor-pointer whitespace-nowrap
              ${activeId === news.id
                ? 'bg-[#FFF8E7] border-[#C19A6B] text-[#5A3E22] translate-y-[2px]'
                : 'bg-[#EDE0C4]/60 border-[#C19A6B]/40 text-[#8B6840] hover:bg-[#F5EDD8]/80'
              }`}
          >
            {news.tabLabel}
          </button>
        ))}
      </div>

      {/* Article content */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3">
        {/* Title */}
        <h3 className="font-game font-black text-sm sm:text-base text-[#5A3E22] mb-1.5 leading-snug">
          {current.title}
        </h3>

        {/* Metadata */}
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

        {/* Paragraphs */}
        <div className="space-y-3">
          {current.paragraphs.map((para, i) => (
            <p key={i} className="text-xs sm:text-sm text-[#5A3E22] leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {/* Links */}
        {current.links && (
          <div className="mt-4 pt-3 border-t border-[#C19A6B]/30">
            <p className="text-[10px] sm:text-xs font-bold text-[#8B5E3C] mb-1.5">{current.linksLabel ?? '新聞連結'}</p>
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
