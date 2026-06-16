import { useState } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { useConversations } from '@lib/hooks/useConversations';
import { ChatList } from '@components/messages/chat-list';
import { ChatWindow } from '@components/messages/chat-window';
import { SEO } from '@components/common/seo';
import { MainLayout } from '@components/layout/main-layout';
import { ProtectedLayout } from '@components/layout/common-layout';
import type { ReactElement, ReactNode } from 'react';

export default function Messages(): JSX.Element {
  const { user } = useAuth();
  const { conversations, loading } = useConversations(user?.id);

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWindow, setShowWindow] = useState(false);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? null;

  const handleSelectConversation = (id: string): void => {
    setActiveConversationId(id);
    setShowWindow(true);
  };

  const handleBack = (): void => {
    setShowWindow(false);
  };

  return (
    <main className='flex min-h-screen w-full max-w-[1000px]'>
      <SEO title='Messages / Twitter' />

      {/* Left panel - conversation list */}
      <div
        className={`
          h-screen w-full shrink-0 overflow-hidden
          xs:w-80 xs:border-r xs:border-light-border xs:dark:border-dark-border
          ${showWindow ? 'hidden xs:block' : 'block'}
        `}
        style={{ minWidth: 0 }}
      >
        <ChatList
          conversations={conversations}
          loading={loading}
          activeConversationId={activeConversationId}
          currentUserId={user?.id ?? ''}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Right panel - chat window */}
      <div
        className={`
          h-screen flex-1 overflow-hidden
          ${!showWindow ? 'hidden xs:flex xs:flex-col' : 'flex flex-col'}
        `}
      >
        <ChatWindow
          conversationId={activeConversationId}
          currentUserId={user?.id ?? ''}
          otherUser={activeConversation?.otherUser ?? null}
          onBack={handleBack}
        />
      </div>
    </main>
  );
}

Messages.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>{page}</MainLayout>
  </ProtectedLayout>
);
