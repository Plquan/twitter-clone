import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { HeroIcon } from '@components/ui/hero-icon';
import { Button } from '@components/ui/button';

type ChatInputProps = {
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled }: ChatInputProps): JSX.Element {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: FormEvent): Promise<void> => {
    e?.preventDefault();

    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const handleInput = (): void => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className='flex items-end gap-3 border-t border-light-border px-4 py-3 dark:border-dark-border'
    >
      {/* Action icons */}
      <div className='flex shrink-0 items-center gap-1 pb-1'>
        <Button
          type='button'
          className='custom-button p-2 text-main-accent hover:bg-main-accent/10'
          disabled={disabled}
        >
          <HeroIcon iconName='PlusIcon' className='h-5 w-5' />
        </Button>
        <Button
          type='button'
          className='custom-button p-2 text-main-accent hover:bg-main-accent/10'
          disabled={disabled}
        >
          <HeroIcon iconName='PhotoIcon' className='h-5 w-5' />
        </Button>
        <Button
          type='button'
          className='custom-button p-2 text-main-accent hover:bg-main-accent/10'
          disabled={disabled}
        >
          <HeroIcon iconName='FaceSmileIcon' className='h-5 w-5' />
        </Button>
      </div>

      {/* Text area */}
      <div className='flex flex-1 items-end rounded-full bg-light-secondary/20 px-4 py-2 dark:bg-dark-secondary/20'>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder='Start a new message'
          disabled={disabled || sending}
          rows={1}
          className='w-full resize-none bg-transparent text-sm text-light-primary outline-none placeholder:text-light-secondary 
                     dark:text-dark-primary dark:placeholder:text-dark-secondary'
          style={{ maxHeight: '120px', overflowY: 'auto' }}
        />
      </div>

      {/* Send button */}
      <Button
        type='submit'
        disabled={!text.trim() || sending || disabled}
        className={`shrink-0 rounded-full p-2 pb-1 transition-colors ${
          text.trim()
            ? 'text-main-accent hover:bg-main-accent/10'
            : 'cursor-not-allowed text-light-secondary dark:text-dark-secondary'
        }`}
      >
        <HeroIcon iconName='PaperAirplaneIcon' className='h-5 w-5' />
      </Button>
    </form>
  );
}
