import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ChooseAvatar } from './features/auth/choose-avatar/choose-avatar';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { Imprint } from './features/legal/imprint/imprint';
import { Privacy } from './features/legal/privacy/privacy';
import { Workspace } from './features/workspace/workspace';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'registrierung', component: Register },
  { path: 'registrierung/avatar', component: ChooseAvatar },
  { path: 'passwort-vergessen', component: ForgotPassword },
  { path: 'passwort-zuruecksetzen', component: ResetPassword },
  { path: 'impressum', component: Imprint },
  { path: 'datenschutz', component: Privacy },
  { path: 'workspace', component: Workspace, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
