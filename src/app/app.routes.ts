import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ChooseAvatar } from './features/auth/choose-avatar/choose-avatar';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { Imprint } from './features/legal/imprint/imprint';
import { Privacy } from './features/legal/privacy/privacy';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'registrierung', component: Register },
  { path: 'registrierung/avatar', component: ChooseAvatar },
  { path: 'passwort-vergessen', component: ForgotPassword },
  { path: 'passwort-zuruecksetzen', component: ResetPassword },
  { path: 'impressum', component: Imprint },
  { path: 'datenschutz', component: Privacy },
  {
    path: 'workspace',
    loadComponent: () => import('./features/workspace/workspace').then((m) => m.Workspace),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/workspace/workspace-home/workspace-home').then((m) => m.WorkspaceHome),
      },
      {
        path: 'channel/:id',
        loadComponent: () => import('./features/workspace/channel-view/channel-view').then((m) => m.ChannelView),
      },
      {
        path: 'neue-nachricht',
        loadComponent: () => import('./features/workspace/new-message/new-message').then((m) => m.NewMessage),
      },
      {
        path: 'dm/:uid',
        loadComponent: () => import('./features/workspace/direct-view/direct-view').then((m) => m.DirectView),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
