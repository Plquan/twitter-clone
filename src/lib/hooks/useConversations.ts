import { useState, useEffect, useRef } from 'react';
import {
  onSnapshot,
  query,
  where,
  orderBy,
  getDoc,
  doc
} from 'firebase/firestore';
import {
  conversationsCollection,
  usersCollection
} from '@lib/firebase/collections';
import type { Conversation } from '@lib/types/message';
import type { User } from '@lib/types/user';

export type ConversationWithUser = Conversation & {
  otherUser: User;
};

type UseConversationsReturn = {
  conversations: ConversationWithUser[];
  loading: boolean;
};

export function useConversations(
  currentUserId: string | undefined
): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationWithUser[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  // Cache user profiles to avoid re-fetching on every snapshot update
  const userCache = useRef<Record<string, User>>({});

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    // Clear cache when user changes
    userCache.current = {};

    const q = query(
      conversationsCollection,
      where('participantIds', 'array-contains', currentUserId),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rawConversations = snapshot.docs.map((d) =>
        d.data({ serverTimestamps: 'estimate' })
      );

      const withUsers = await Promise.all(
        rawConversations.map(async (conv) => {
          const otherUserId = conv.participantIds.find(
            (id: string) => id !== currentUserId
          ) as string;

          // Use cached user if available, otherwise fetch and cache
          if (!userCache.current[otherUserId]) {
            const userSnap = await getDoc(doc(usersCollection, otherUserId));
            userCache.current[otherUserId] = userSnap.data() as User;
          }

          return { ...conv, otherUser: userCache.current[otherUserId] };
        })
      );

      setConversations(withUsers);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUserId]);

  return { conversations, loading };
}
