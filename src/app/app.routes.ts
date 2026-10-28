import { Routes } from '@angular/router';
import { ChooseAvatar } from './features/auth/choose-avatar/choose-avatar';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'registrierung', component: Register },
  { path: 'registrierung/avatar', component: ChooseAvatar },
  { path: '**', redirectTo: '' },
];
