import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { authGuard } from './guards/auth-guard';
import { Profile } from './components/profile/profile';
import { Users } from './components/users/users';
import { Settings } from './components/settings/settings';
import { Messages } from './components/messages/messages';
import { ResetPassword } from './components/reset-password/reset-password';
import {
  MyWorldPage
} from './components/my-world/my-world-page/my-world-page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'users', component: Users, canActivate: [authGuard] },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'settings', component: Settings },
  { path: 'profile/:id', component: Profile, canActivate: [authGuard] },
  { path: 'messages', component: Messages, canActivate: [authGuard] },
  { path: 'users/following', component: Users, canActivate: [authGuard] },
  { path: 'users/followers', component: Users, canActivate: [authGuard] },
  { path: 'users/all', component: Users, canActivate: [authGuard] },
  { path: 'reset-password/:token', component: ResetPassword },
  {
    path: 'my-world',
    component: MyWorldPage
  },
  { path: '**', redirectTo: 'login' }
];
