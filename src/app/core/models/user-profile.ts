import { Timestamp } from '@angular/fire/firestore';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  presence?: 'online' | 'away' | 'offline';
  lastActive?: Timestamp | null;
}


export interface AppUser extends UserProfile {
  uid: string;
}
