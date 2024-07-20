import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'main',
    loadComponent: () => import('./components/main-page/main-page.component').then(c => c.MainPageComponent),
    title: 'Shvydkyy_test'
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'main',
  },
];
