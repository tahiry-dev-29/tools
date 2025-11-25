import { Routes } from '@angular/router';
import { EditorLayoutComponent } from './editor-layout.component';

export const editorRoute: Routes = [{
  path: '',
  component: EditorLayoutComponent,
  children: [
    {
      path: 'markdown-editor',
     loadComponent: () => import('./editor-layout.component').then((m) => m.EditorLayoutComponent) 
    }
  ]
}];
