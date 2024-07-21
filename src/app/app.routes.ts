import { Routes } from '@angular/router';
import { LoggedInAuthGuard } from './services/router-guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent),
    title: 'Shvydkyy_test'
  },

  {
    path: 'main',
    canActivate: [LoggedInAuthGuard],
    loadComponent: () => import('./components/main-page/main-page.component').then(c => c.MainPageComponent),
    title: 'Shvydkyy_test'
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'main',
  },
];
