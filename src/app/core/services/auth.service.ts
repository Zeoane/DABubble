import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Auth,
  authState,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  verifyPasswordResetCode,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { RegistrationData } from './registration.service';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

const DEFAULT_AVATAR = 'img/avatars/avatar-1.svg';
const GUEST_PROFILE: UserProfile = { name: 'Gast', email: '', avatar: DEFAULT_AVATAR };

/**
 * Wraps Firebase Authentication and keeps the user document in Firestore.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  readonly user$: Observable<User | null> = authState(this.auth);


  /**
   * Creates the account with name and avatar; if saving the profile fails,
   * the account is removed again so the email stays free.
   */
  async register(data: RegistrationData, avatar: string): Promise<void> {
    const { user } = await this.inContext(() =>
      createUserWithEmailAndPassword(this.auth, data.email, data.password),
    );
    try {
      await this.inContext(() => updateProfile(user, { displayName: data.name, photoURL: avatar }));
      await this.saveUser(user.uid, { name: data.name, email: data.email, avatar });
    } catch (error) {
      await this.inContext(() => deleteUser(user));
      throw error;
    }
  }


  async logIn(email: string, password: string): Promise<void> {
    await this.inContext(() => signInWithEmailAndPassword(this.auth, email, password));
  }


  /**
   * Signs in with a Google popup; on the first login the profile is created
   * from the Google account (name, email, photo).
   */
  async logInWithGoogle(): Promise<void> {
    const { user } = await this.inContext(() => signInWithPopup(this.auth, new GoogleAuthProvider()));
    const profileRef = doc(this.firestore, 'users', user.uid);
    const existing = await this.inContext(() => getDoc(profileRef));
    if (!existing.exists()) {
      await this.saveUser(user.uid, googleProfile(user));
    }
  }


  async logOut(): Promise<void> {
    await this.inContext(() => signOut(this.auth));
  }


  /**
   * Signs in without an account (Firebase "anonymous") and stores a guest profile.
   */
  async logInAsGuest(): Promise<void> {
    const { user } = await this.inContext(() => signInAnonymously(this.auth));
    await this.inContext(() =>
      updateProfile(user, { displayName: GUEST_PROFILE.name, photoURL: GUEST_PROFILE.avatar }),
    );
    await this.saveUser(user.uid, GUEST_PROFILE);
  }


  /**
   * Sends the reset mail; its link opens "/passwort-zuruecksetzen" once the
   * action URL is set in the Firebase console (Authentication → Templates).
   */
  async sendPasswordReset(email: string): Promise<void> {
    this.auth.languageCode = 'de';
    await this.inContext(() => sendPasswordResetEmail(this.auth, email));
  }


  /**
   * Checks the code from the mail link and returns the account's email.
   */
  verifyResetCode(code: string): Promise<string> {
    return this.inContext(() => verifyPasswordResetCode(this.auth, code));
  }


  async resetPassword(code: string, password: string): Promise<void> {
    await this.inContext(() => confirmPasswordReset(this.auth, code, password));
  }


  /**
   * Stores the profile in "users/{uid}" so other members can see it.
   */
  private saveUser(uid: string, profile: UserProfile): Promise<void> {
    return this.inContext(() => setDoc(doc(this.firestore, 'users', uid), profile));
  }


  /**
   * AngularFire expects its functions to run inside an injection context.
   */
  private inContext<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }
}


/**
 * Reads the Firebase error code, e.g. "auth/invalid-credential".
 */
export function authErrorCode(error: unknown): string {
  return (error as { code?: string })?.code ?? '';
}


function googleProfile(user: User): UserProfile {
  return {
    name: user.displayName ?? user.email ?? 'Gast',
    email: user.email ?? '',
    avatar: user.photoURL ?? DEFAULT_AVATAR,
  };
}
