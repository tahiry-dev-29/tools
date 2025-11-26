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
      imageUrl: 'assets/images/password_generators.png',
      path: '/projects/password-generator',
    },{
      id: '2',
      title: 'Markdown Editor',
      description: 'A real-time Markdown editor that allows users to write and preview Markdown syntax simultaneously. It supports common Markdown features, provides syntax highlighting, and enables easy export of content.',
      imageUrl: 'assets/images/markdown_editor.png',
      path: '/projects/markdown-editor',
    },
    {
      id: '3',
      title: 'Convertion files and images',
      description: 'A Convertion files and images application designed to help users convert files and images to different formats. It supports various options like length, character types (uppercase, lowercase, numbers, symbols), and exclusion of ambiguous characters.',
      imageUrl: 'http://placehold.co/600x400',
      path: '/projects/convertion-files-and-images',
    }
  ])

  get projects() {
    return this._projects.asReadonly();
  }

}
