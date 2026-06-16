import cn from 'clsx';
import type { ConversationWithUser } from '@lib/hooks/useConversations';
import type { Timestamp } from 'firebase/firestore';

type ConversationItemProps = {
  conversation: ConversationWithUser;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
};

function formatPreviewTime(ts: Timestamp | null): string {
  if (!ts) return '';
  const date = ts.toDate();
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)
    return date.toLocaleDateString('en-GB', { weekday: 'short' });
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function ConversationItem({
  conversation,
  isActive,
  currentUserId,
  onClick
}: ConversationItemProps): JSX.Element {
  const { otherUser, lastMessage, lastMessageAt, lastSenderId } = conversation;
  const isOwn = lastSenderId === currentUserId;

  return (
    <button
      onClick={onClick}
      className={cn(
        'hover-animation flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors',
        isActive
          ? 'bg-main-accent/10'
          : 'hover:bg-light-primary/5 dark:hover:bg-dark-primary/5'
      )}
    >
      {/* Avatar */}
      <div className='relative shrink-0'>
        <img
          src={otherUser.photoURL}
          alt={otherUser.name}
          className='h-12 w-12 rounded-full object-cover'
        />
      </div>

      {/* Content */}
      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='flex items-center justify-between gap-2'>
          <span className='truncate font-bold text-light-primary dark:text-dark-primary'>
            {otherUser.name}
          </span>
          <span className='shrink-0 text-xs text-light-secondary dark:text-dark-secondary'>
            {formatPreviewTime(lastMessageAt)}
          </span>
        </div>
        {lastMessage && (
          <p className='truncate text-sm text-light-secondary dark:text-dark-secondary'>
            {isOwn ? 'You: ' : ''}
            {lastMessage}
          </p>
        )}
      </div>
    </button>
  );
}

type ChatListProps = {
  conversations: ConversationWithUser[];
  loading: boolean;
  activeConversationId: string | null;
  currentUserId: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectConversation: (id: string) => void;
};

export function ChatList({
  conversations,
  loading,
  activeConversationId,
  currentUserId,
  searchQuery,
  onSearchChange,
  onSelectConversation
}: ChatListProps): JSX.Element {
  const filtered = conversations.filter(
    (c) =>
      c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='flex h-full flex-col border-r border-light-border dark:border-dark-border'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-main-background px-4 pt-4 pb-2'>
        <h2 className='mb-3 text-xl font-extrabold text-light-primary dark:text-dark-primary'>
          Messages
        </h2>
        {/* Search bar */}
        <div className='flex items-center gap-2 rounded-full bg-light-secondary/20 px-4 py-2 dark:bg-dark-secondary/20'>
          <svg
            className='h-4 w-4 shrink-0 text-light-secondary dark:text-dark-secondary'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search Direct Messages'
            className='flex-1 bg-transparent text-sm text-light-primary outline-none placeholder:text-light-secondary dark:text-dark-primary dark:placeholder:text-dark-secondary'
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className='flex-1 overflow-y-auto px-2 pb-4'>
        {loading ? (
          <div className='flex flex-col gap-3 p-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='flex animate-pulse items-center gap-3'>
                <div className='h-12 w-12 shrink-0 rounded-full bg-light-secondary/30 dark:bg-dark-secondary/30' />
                <div className='flex flex-1 flex-col gap-2'>
                  <div className='h-3 w-3/4 rounded bg-light-secondary/30 dark:bg-dark-secondary/30' />
                  <div className='h-3 w-1/2 rounded bg-light-secondary/20 dark:bg-dark-secondary/20' />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className='mt-10 px-4 text-center'>
            <p className='font-bold text-light-primary dark:text-dark-primary'>
              {searchQuery ? 'No results found' : 'No messages yet'}
            </p>
            <p className='mt-1 text-sm text-light-secondary dark:text-dark-secondary'>
              {searchQuery
                ? 'Try a different search term'
                : 'Start a conversation with someone you follow'}
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-0.5 pt-2'>
            {filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeConversationId === conv.id}
                currentUserId={currentUserId}
                onClick={() => onSelectConversation(conv.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
