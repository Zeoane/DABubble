import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ChooseAvatar } from './features/auth/choose-avatar/choose-avatar';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Workspace } from './features/workspace/workspace';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'registrierung', component: Register },
  { path: 'registrierung/avatar', component: ChooseAvatar },
  { path: 'workspace', component: Workspace, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
