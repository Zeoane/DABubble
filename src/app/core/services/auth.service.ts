import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { RegistrationData } from './registration.service';

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
      await this.saveUser(user, data, avatar);
    } catch (error) {
      await this.inContext(() => deleteUser(user));
      throw error;
    }
  }


  async logIn(email: string, password: string): Promise<void> {
    await this.inContext(() => signInWithEmailAndPassword(this.auth, email, password));
  }


  async logOut(): Promise<void> {
    await this.inContext(() => signOut(this.auth));
  }


  /**
   * Stores the profile in "users/{uid}" so other members can see it.
   */
  private saveUser(user: User, data: RegistrationData, avatar: string): Promise<void> {
    const profile = { name: data.name, email: data.email, avatar };
    return this.inContext(() => setDoc(doc(this.firestore, 'users', user.uid), profile));
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
