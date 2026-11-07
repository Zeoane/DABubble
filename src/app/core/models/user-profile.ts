import { Timestamp } from '@angular/fire/firestore';

/**
 * Profile stored in Firestore under "users/{uid}".
 */
export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  /** Online status, see PresenceService. */
  presence?: 'online' | 'away' | 'offline';
  /** Last sign of life while the app was open. */
  lastActive?: Timestamp | null;
}


/**
 * A profile together with its document id (the Firebase uid).
 */
export interface AppUser extends UserProfile {
  uid: string;
}
