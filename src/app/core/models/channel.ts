import { Timestamp } from '@angular/fire/firestore';

/**
 * Channel stored in Firestore under "channels/{id}".
 */
export interface Channel {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Timestamp | null;
  members: string[];
}
