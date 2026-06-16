import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { HeroIcon } from '@components/ui/hero-icon';
import { Button } from '@components/ui/button';
import { formatNumber } from '@lib/date';
import { sendMessage, markMessagesAsSeen } from '@lib/firebase/chat-utils';
import { useMessages } from '@lib/hooks/useMessages';
import type { User } from '@lib/types/user';
import type { Timestamp } from 'firebase/firestore';

type ChatWindowProps = {
  conversationId: string | null;
  currentUserId: string;
  otherUser: User | null;
  onBack?: () => void;
};

function formatJoinedDate(ts: Timestamp): string {
  return ts
    .toDate()
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function ChatWindow({
  conversationId,
  currentUserId,
  otherUser,
  onBack
}: ChatWindowProps): JSX.Element {
  const { messages, loading } = useMessages(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as seen when conversation is opened
  useEffect(() => {
    if (!conversationId) return;
    void markMessagesAsSeen(conversationId, currentUserId);
  }, [conversationId, currentUserId, messages.length]);

  const handleSend = async (text: string): Promise<void> => {
    if (!conversationId) return;
    await sendMessage(conversationId, currentUserId, text);
  };

  // Empty state - no conversation selected
  if (!conversationId || !otherUser) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-4 text-center'>
        <div className='rounded-full bg-main-accent/10 p-6'>
          <HeroIcon
            iconName='EnvelopeOpenIcon'
            className='h-10 w-10 text-main-accent'
          />
        </div>
        <div>
          <h3 className='text-xl font-bold text-light-primary dark:text-dark-primary'>
            Select a message
          </h3>
          <p className='mt-1 text-sm text-light-secondary dark:text-dark-secondary'>
            Choose from your existing conversations, or start a new one.
          </p>
        </div>
      </div>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <div className='flex h-full flex-col'>
      {/* Header */}
      <div className='flex items-center gap-3 border-b border-light-border px-4 py-3 dark:border-dark-border'>
        {onBack && (
          <Button
            onClick={onBack}
            className='custom-button p-2 text-light-primary hover:bg-light-primary/10 dark:text-dark-primary dark:hover:bg-dark-primary/10'
          >
            <HeroIcon iconName='ArrowLeftIcon' className='h-5 w-5' />
          </Button>
        )}
        <img
          src={otherUser.photoURL}
          alt={otherUser.name}
          className='h-9 w-9 rounded-full object-cover'
        />
        <div className='flex-1'>
          <h3 className='font-bold text-light-primary dark:text-dark-primary'>
            {otherUser.name}
          </h3>
        </div>
        <Button className='custom-button p-2 text-light-secondary hover:bg-light-primary/10 dark:text-dark-secondary dark:hover:bg-dark-primary/10'>
          <HeroIcon iconName='EllipsisHorizontalIcon' className='h-5 w-5' />
        </Button>
      </div>

      {/* Messages area */}
      <div className='flex-1 overflow-y-auto px-4 py-6'>
        {/* Profile card shown at the start of every conversation */}
        {!loading && (
          <div className='mb-8 flex flex-col items-center gap-3 text-center'>
            <img
              src={otherUser.photoURL}
              alt={otherUser.name}
              className='h-20 w-20 rounded-full object-cover'
            />
            <div>
              <p className='text-xl font-extrabold text-light-primary dark:text-dark-primary'>
                {otherUser.name}
              </p>
              <p className='text-sm text-light-secondary dark:text-dark-secondary'>
                @{otherUser.username}
              </p>
              <p className='mt-1 text-sm text-light-secondary dark:text-dark-secondary'>
                <span className='font-bold text-light-primary dark:text-dark-primary'>
                  {formatNumber(otherUser.followers.length)}
                </span>{' '}
                Followers · Joined {formatJoinedDate(otherUser.createdAt)}
              </p>
            </div>
            <Link href={`/user/${otherUser.username}`}>
              <a className='rounded-full border border-light-border px-5 py-2 text-sm font-bold text-light-primary transition hover:bg-light-primary/10 dark:border-dark-border dark:text-dark-primary dark:hover:bg-dark-primary/10'>
                View Profile
              </a>
            </Link>
          </div>
        )}

        {/* Messages */}
        {loading ? (
          <div className='flex flex-col gap-3'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`flex animate-pulse ${
                  i % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}
              >
                <div className='h-10 w-48 rounded-2xl bg-light-secondary/20 dark:bg-dark-secondary/20' />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            <div className='flex flex-col gap-1.5'>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChatMessage
                    message={msg}
                    isOwn={msg.senderId === currentUserId}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  );
}
