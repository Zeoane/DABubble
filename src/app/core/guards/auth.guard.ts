import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Lets only signed-in users through, everyone else goes back to the login.
 */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService).user$.pipe(
    take(1),
    map((user) => (user ? true : router.createUrlTree(['/']))),
  );
};
