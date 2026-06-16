import { useState, useEffect } from 'react';
import { onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { messagesCollection } from '@lib/firebase/collections';
import type { Message } from '@lib/types/message';

type UseMessagesReturn = {
  messages: Message[];
  loading: boolean;
};

export function useMessages(
  conversationId: string | null,
  messageLimit = 50
): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessages([]);

    const q = query(
      messagesCollection(conversationId),
      orderBy('createdAt', 'asc'),
      limit(messageLimit)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) =>
        doc.data({ serverTimestamps: 'estimate' })
      );
      setMessages(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [conversationId, messageLimit]);

  return { messages, loading };
}
