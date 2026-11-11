import { Timestamp } from '@angular/fire/firestore';

export interface Channel {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Timestamp | null;
  members: string[];
}
