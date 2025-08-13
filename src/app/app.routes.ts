import {Routes} from '@angular/router';
import {Home} from './core/pages/home';
import {PasswordGenerator} from './features/password-generator/components/password-generator';

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {title: 'Home', path: 'home', component: Home},
  {
    title: 'Projects',
    path: 'projects',
    children: [
      {
        title: 'Password Generator',
        path: 'password-generator',
        component: PasswordGenerator,
      },
      {
        title: 'markdown Editor',
        path: 'markdown-editor',
        loadChildren: () => import('./features/markdown-editor/markdownEditor-routes').then((M) => M.markdownEditorRoute)
      },
    ]
  },
  {
    title: 'Not Found',
    path: '**',
    loadComponent: () =>
      import('./core/pages/not-found').then((m) => m.NotFound),
  },
];
