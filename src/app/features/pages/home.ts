import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectLists } from '../../core/services/project-lists';
import { Card } from '../../shared/components/card';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Card],
  template: `
    <div class="min-h-screen text-white p-8 flex flex-col items-center justify-between">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto w-full">
        @for (project of projects(); track project.id) {
          <app-card [project]="project" />
        }
      </div>
    </div>
  `,
})
export class Home {
  private projectService = inject(ProjectLists);
  projects = this.projectService.projects;
}
