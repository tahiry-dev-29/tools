import { Routes } from '@angular/router';
import { Home } from './features/pages/home';
import { PasswordGenerator } from './features/password-generator/components/password-generator';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { title: 'Home', path: 'home', component: Home },
  {
    title: 'Projects',
    path: 'projects',
    children: [
      {
        title: 'Password Generator',
        path: 'password-generator',
        component: PasswordGenerator,
      },
    ]
  },
  {
    title: 'Not Found',
    path: '**',
    loadComponent: () =>
      import('./features/pages/not-found').then((m) => m.NotFound),
  },
];
