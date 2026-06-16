import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';

export type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
  seen: boolean;
};

export type Conversation = {
  id: string;
  participantIds: string[];
  lastMessage: string | null;
  lastMessageAt: Timestamp | null;
  lastSenderId: string | null;
  createdAt: Timestamp;
};

export const messageConverter: FirestoreDataConverter<Message> = {
  toFirestore(message) {
    return { ...message };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { ...data, id: snapshot.id } as Message;
  }
};

export const conversationConverter: FirestoreDataConverter<Conversation> = {
  toFirestore(conversation) {
    return { ...conversation };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { ...data, id: snapshot.id } as Conversation;
  }
};
