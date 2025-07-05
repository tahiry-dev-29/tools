import {Injectable, signal} from '@angular/core';
import {Project} from '../models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectListsService {

  private _projects = signal<Project[]>([
    {
      id: '1',
      title: 'Password Generator',
      description: 'A secure and customizable password generator application designed to help users create strong, unique passwords for their online accounts. It supports various options like length, character types (uppercase, lowercase, numbers, symbols), and exclusion of ambiguous characters.',
      imageUrl: 'https://placehold.co/400x250/1a202c/e2e8f0?text=Password%20Generator',
      path: '/projects/password-generator',
    },{
      id: '2',
      title: 'Markdown Editor',
      description: 'A real-time Markdown editor that allows users to write and preview Markdown syntax simultaneously. It supports common Markdown features, provides syntax highlighting, and enables easy export of content.',
      imageUrl: 'https://placehold.co/400x250/1a202c/e2e8f0?text=Markdown%20Editor',
      path: '/projects/markdown-editor',
    },
  ])

  get projects() {
    return this._projects.asReadonly();
  }

}
