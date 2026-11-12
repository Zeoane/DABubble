import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Lets only signed-in users into the workspace; everyone else goes to the login. */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService).user$.pipe(
    take(1),
    map((user) => (user ? true : router.createUrlTree(['/']))),
  );
};

/** Sends users who are still signed in (e.g. after a reload) straight to the workspace. */
export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService).user$.pipe(
    take(1),
    map((user) => (user ? router.createUrlTree(['/workspace']) : true)),
  );
};
