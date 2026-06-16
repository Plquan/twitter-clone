import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from './app';
import { conversationsCollection, messagesCollection } from './collections';
import type { Conversation } from '@lib/types/message';

/**
 * Get or create a conversation between two users.
 * Returns the conversation document id.
 */
export async function getOrCreateConversation(
  currentUserId: string,
  targetUserId: string
): Promise<string> {
  // Query for existing conversation containing both users
  const q = query(
    conversationsCollection,
    where('participantIds', 'array-contains', currentUserId)
  );

  const snapshot = await getDocs(q);

  const existing = snapshot.docs.find((docSnap) => {
    const data = docSnap.data() as Conversation;
    return data.participantIds.includes(targetUserId);
  });

  if (existing) return existing.id;

  // Create a new conversation using the raw collection reference to avoid id type constraint
  const rawCol = collection(db, 'conversations');

  const newConversation = {
    participantIds: [currentUserId, targetUserId],
    lastMessage: null,
    lastMessageAt: null,
    lastSenderId: null,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(rawCol, newConversation);
  return docRef.id;
}

/**
 * Send a message in a conversation.
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<void> {
  const batch = writeBatch(db);

  // Add the message to the sub-collection
  const msgColRef = messagesCollection(conversationId);
  const msgDocRef = doc(msgColRef);

  batch.set(msgDocRef, {
    id: msgDocRef.id,
    text,
    senderId,
    createdAt: serverTimestamp() as never,
    seen: false
  });

  // Update the conversation's last message
  const convRef = doc(conversationsCollection, conversationId);
  batch.update(convRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    lastSenderId: senderId
  });

  await batch.commit();
}

/**
 * Mark all unread messages from the other user as seen.
 */
export async function markMessagesAsSeen(
  conversationId: string,
  currentUserId: string
): Promise<void> {
  const msgColRef = messagesCollection(conversationId);
  const q = query(msgColRef, where('seen', '==', false));
  const snapshot = await getDocs(q);

  const batch = writeBatch(db);

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.senderId !== currentUserId) {
      batch.update(docSnap.ref, { seen: true });
    }
  });

  await batch.commit();
}

/**
 * Get a user document by id.
 */
export async function getUserById(userId: string) {
  const { usersCollection } = await import('./collections');
  const snap = await getDoc(doc(usersCollection, userId));
  return snap.exists() ? snap.data() : null;
}
