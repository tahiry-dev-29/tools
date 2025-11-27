import {Routes} from '@angular/router';
import {Home} from './core/pages/home';
import {PasswordGenerator} from './features/password-generator/components/password-generator';
import {maintenanceGuard} from './core/guards/maintenance-guard';

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {title: 'Home', path: 'home', component: Home},
  {
    title: 'Maintenance',
    path: 'maintenance',
    loadComponent: () => import('./features/maintenance/pages/maintenance-page/maintenance-page').then(m => m.MaintenancePage)
  },
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
        loadChildren: () => import('./features/editor/editor.routes').then((m) => m.editorRoute)
      },
      {
        title: 'Media Converter',
        path: 'media-converter',
        canActivate: [maintenanceGuard],
        loadChildren: () => import('./features/media-converter/media-converter.routes').then((m) => m.mediaConverterRoutes)
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
