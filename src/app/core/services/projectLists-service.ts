import {Injectable, signal} from '@angular/core';
import {Project} from '../models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectLists {

  private _projects = signal<Project[]>([
    {
      id: '1',
      title: 'Password Generator',
      description: 'A password generator application to help you. lorem ipsum dolor sit amet.',
      imageUrl: 'https://placehold.co/400x250/1a202c/e2e8f0?text=E-commerce',
      path: '/projects/password-generator',
    },{
      id: '2',
      title: 'Password Generator',
      description: 'A password generator application to help you. lorem ipsum dolor sit amet.',
      imageUrl: 'https://placehold.co/400x250/1a202c/e2e8f0?text=E-commerce',
      path: '/projects/password-generator',
    },
  ])

  get projects() {
    return this._projects.asReadonly();
  }
}
