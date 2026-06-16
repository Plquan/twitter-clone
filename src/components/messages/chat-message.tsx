import cn from 'clsx';
import type { Message } from '@lib/types/message';
import type { Timestamp } from 'firebase/firestore';

type ChatMessageProps = {
  message: Message;
  isOwn: boolean;
};

function formatMsgTime(ts: Timestamp | null): string {
  if (!ts) return '';
  const date = ts.toDate();
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function ChatMessage({ message, isOwn }: ChatMessageProps): JSX.Element {
  const { text, createdAt } = message;

  return (
    <div className={cn('flex w-full', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'group relative max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
          isOwn
            ? 'rounded-br-sm bg-main-accent text-white'
            : 'rounded-bl-sm bg-light-secondary/20 text-light-primary dark:bg-dark-secondary/20 dark:text-dark-primary'
        )}
      >
        <p className='break-words leading-relaxed'>{text}</p>
        <span
          className={cn(
            'mt-1 block text-right text-[10px] opacity-0 transition-opacity duration-200 group-hover:opacity-70',
            isOwn
              ? 'text-white/80'
              : 'text-light-secondary dark:text-dark-secondary'
          )}
        >
          {formatMsgTime(createdAt)}
        </span>
      </div>
    </div>
  );
}
