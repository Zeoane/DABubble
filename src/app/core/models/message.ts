import { Timestamp } from '@angular/fire/firestore';

/**
 * Message stored in Firestore under "channels/{channelId}/messages/{id}".
 */
export interface Message {
  id: string;
  text: string;
  authorId: string;
  /** Null for a moment while the server time of a new message is pending. */
  createdAt: Timestamp | null;
  /** Emoji → ids of the members who reacted with it. */
  reactions?: Record<string, string[]>;
}
