/**
 * Profile stored in Firestore under "users/{uid}".
 */
export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}


/**
 * A profile together with its document id (the Firebase uid).
 */
export interface AppUser extends UserProfile {
  uid: string;
}
