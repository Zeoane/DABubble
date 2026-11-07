import { Timestamp } from '@angular/fire/firestore';

export interface Message {
  id: string;
  text: string;
  authorId: string;
  createdAt: Timestamp | null;
  reactions?: Record<string, string[]>;
  replyCount?: number;
  lastReplyAt?: Timestamp | null;
}
