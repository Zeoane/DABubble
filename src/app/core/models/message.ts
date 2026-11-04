import { Timestamp } from '@angular/fire/firestore';

/**
 * Message stored in Firestore under "{chat}/messages/{id}", an answer under
 * "{chat}/messages/{messageId}/replies/{id}".
 */
export interface Message {
  id: string;
  text: string;
  authorId: string;
  /** Null for a moment while the server time of a new message is pending. */
  createdAt: Timestamp | null;
  /** Emoji → ids of the members who reacted with it. */
  reactions?: Record<string, string[]>;
  /** Number of answers in the thread (only on messages, not on answers). */
  replyCount?: number;
  lastReplyAt?: Timestamp | null;
}
