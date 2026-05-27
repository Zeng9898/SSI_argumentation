import { useState, useRef, useEffect } from 'react';
import { Icon } from '../ui/woodKit';
import { api } from '../../lib/api';
import aiAvatar from '../../assets/illustrations/irasutoya_teacher_boy.png';
import studentAvatar from '../../assets/illustrations/irasutoya_student_clean.png';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export const INITIAL_CHAT_MESSAGE: Message = {
  id: '0',
  role: 'ai',
  content: '你可以先說說看，你比較贊成還是不贊成讓生成式AI取代原本的文字生產工作？',
};

interface Props {
  scenarioId: number;
  messages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
  readOnly?: boolean;
}

export default function AIChatPanel({ scenarioId, messages: externalMessages, onMessagesChange, readOnly }: Props) {
  const [internalMessages, setInternalMessages] = useState<Message[]>([INITIAL_CHAT_MESSAGE]);
  const messages = externalMessages ?? internalMessages;
  const setMessages = onMessagesChange ?? setInternalMessages;

  const [input, setInput]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    setIsLoading(true);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const withUser = [...messages, userMsg];
    setMessages(withUser);

    try {
      const { assistantMessage } = await api.sendAiChat(scenarioId, text);
      const aiMsg: Message = {
        id:      (Date.now() + 1).toString(),
        role:    'ai',
        content: assistantMessage,
      };
      setMessages([...withUser, aiMsg]);
    } catch (err) {
      console.error('[AIChatPanel] send error:', err);
      const errMsg: Message = {
        id:      (Date.now() + 1).toString(),
        role:    'ai',
        content: '抱歉，發生錯誤，請稍後再試。',
      };
      setMessages([...withUser, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-3 sm:px-4 pt-3 pb-2 border-b-2 border-[#C19A6B]/25
                      flex items-center gap-1.5">
        <Icon name="forum" filled className="text-lg text-[#3A8FCC]" />
        <h3 className="font-game font-black text-xs sm:text-sm text-[#5A3E22] flex-1 min-w-0 truncate">
          AI 論證擂台
        </h3>
        <span className="text-[10px] font-bold bg-[#7BC8F0]/25 text-[#1A5C8A]
                         px-1.5 py-0.5 rounded-full border border-[#3A8FCC]/30 whitespace-nowrap">
          {messages.filter((m) => m.role === 'user').length} 則
        </span>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 animate-msg-in
                                        ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <img
              src={msg.role === 'ai' ? aiAvatar : studentAvatar}
              alt={msg.role === 'ai' ? 'AI' : '學生'}
              className="shrink-0 w-9 h-9 object-contain animate-float drop-shadow-[0_4px_4px_rgba(91,66,38,0.3)]"
            />
            <div className={`max-w-[78%] rounded-2xl px-3 py-2.5 border-2
                             transition-all duration-200 hover:-translate-y-0.5 cursor-default
              ${msg.role === 'ai'
                ? 'bg-white/80 border-[#C19A6B]/50 rounded-bl-sm hover:shadow-[0_4px_10px_rgba(91,66,38,0.14)]'
                : 'bg-linear-to-br from-[#D8F0C0] to-[#B8E490] border-[#5C8A2E]/60 rounded-br-sm hover:shadow-[0_4px_10px_rgba(92,138,46,0.22)]'
              }`}>
              <p className={`text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'ai' ? 'text-[#5A3E22]' : 'text-[#2E5C1A]'}`}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {/* Loading bubble */}
        {isLoading && (
          <div className="flex items-end gap-2">
            <img src={aiAvatar} alt="AI" className="shrink-0 w-9 h-9 object-contain animate-float drop-shadow-[0_4px_4px_rgba(91,66,38,0.3)]" />
            <div className="bg-white/80 border-2 border-[#C19A6B]/50 rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#C19A6B] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-[#C19A6B] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-[#C19A6B] rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {!readOnly && <div className="shrink-0 px-3 sm:px-4 py-2.5 border-t-2 border-[#C19A6B]/25 bg-[#EDE0C4]/30">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="輸入你的論點…"
            rows={2}
            disabled={isLoading}
            className="flex-1 min-w-0 resize-none
                       bg-white/70 border-2 border-[#C19A6B]/50 rounded-xl
                       px-3 py-2 text-sm text-[#5A3E22] placeholder-[#B0A090]
                       focus:outline-none focus:border-[#3A8FCC]/60 focus:bg-white/90
                       disabled:opacity-60
                       transition-all duration-200 font-game leading-relaxed"
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                       bg-linear-to-b from-[#7BC8F0] to-[#3A8FCC] text-white
                       shadow-[0_3px_0_#1E6A9E] border border-[#3A8FCC]/60
                       hover:from-[#90D0F5] hover:to-[#4A9FDD]
                       active:translate-y-0.5 active:shadow-none
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-150 cursor-pointer"
          >
            <Icon name="send" filled className="text-base" />
          </button>
        </div>
      </div>}
    </div>
  );
}
