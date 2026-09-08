import React, { useState, useRef } from 'react';
import { Send, Paperclip, Sparkles, Smile, Image } from 'lucide-react';

interface ChatComposerProps {
  onSendMessage: (text: string) => void;
  onOpenTemplates: () => void;
  onAttachFile: () => void;
  disabled?: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  onOpenTemplates,
  onAttachFile,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSendMessage(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t border-slate-200 bg-white">
      <div className="flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-[#5B4DB7]/30 focus-within:border-[#5B4DB7] transition-all">
        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1 pl-1 pb-1">
          <button
            type="button"
            onClick={onOpenTemplates}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#5B4DB7] hover:bg-purple-50 transition-colors"
            title="Choose Quick Business Template"
          >
            <Sparkles className="w-4 h-4 text-[#5B4DB7]" />
          </button>

          <button
            type="button"
            onClick={onAttachFile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Attach Document or Proposal"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message (Press Enter to send, Shift+Enter for newline)..."
          className="flex-1 bg-transparent text-xs py-2 px-2 text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none max-h-32 leading-relaxed"
          disabled={disabled}
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className={`p-2 rounded-xl flex items-center justify-center transition-all ${
            text.trim() && !disabled
              ? 'bg-[#5B4DB7] hover:bg-[#4E41A2] text-white shadow-xs'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <Send className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
};
