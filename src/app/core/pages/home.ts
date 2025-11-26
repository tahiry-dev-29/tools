import { Component, inject } from '@angular/core';

import { ProjectListsService } from '../services/projectLists-service';
import { Card } from '../../shared/components/card';

@Component({
  selector: 'app-home',
  imports: [Card],
  template: `
    <div class="min-h-screen text-white p-8 flex flex-col items-center justify-between">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto w-full items-start">
        @for (project of projects(); track project.id) {
          <app-card [project]="project" />
        }
      </div>
    </div>
  `,
})
export class Home {
  private projectService = inject(ProjectListsService);
  projects = this.projectService.projects;
}
