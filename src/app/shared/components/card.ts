import { Component, input, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { Project } from '../../core/models/project';

@Component({
  selector: 'app-card',
  imports: [NgOptimizedImage],
  template: `
    <div class="min-w-72 bg-white/10 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden
                transform transition-all duration-150 hover:scale-105 hover:shadow-3xl
                border border-white/20 hover:border-purple-500">
      <img
        [ngSrc]="project().imageUrl"
        alt="{{ project().title }}"
        class="w-full h-36 object-cover rounded-t-xl"
        width="288" height="144" priority
      />

      <div class="p-5">
        <h3 class="text-xl font-bold text-purple-300 mb-1 leading-tight line-clamp-1">{{ project().title }}</h3>
        <p class="text-gray-300 text-sm mb-3 line-clamp-3">{{ project().description }}</p>

        <div class="flex flex-col sm:flex-row justify-between gap-3 mt-4">
          @if (project().path) {
            <a
              (click)="navigateToProject()"
              class="flex-1 inline-flex items-center justify-center px-4 py-2
              bg-white/10 text-white rounded-lg cursor-pointer
              hover:bg-white/20 transition-colors duration-200
              text-sm font-medium
              border border-white/20 hover:border-white/40
              shadow-sm hover:shadow-md"
              >
            <span class="material-icons text-sm mr-1">visibility</span>
            View Project
            </a>
          }
        </div>
      </div>
    </div>
  `,
})
export class Card {
  project = input.required<Project>();
  private router = inject(Router);

  /**
   * Navigates to the project's detail page using the path defined in the project data.
   */
  navigateToProject(): void {
    if (this.project().path) {
      this.router.navigate([this.project().path]);
    } else {
      console.warn(`No path defined for project: ${this.project().title}`);
    }
  }
}
