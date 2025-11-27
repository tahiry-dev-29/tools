import { Component, input, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '../../core/models/project';

@Component({
  selector: 'app-card',
  imports: [],
  template: `
    <div class="min-w-72 bg-white/10 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden
                transform transition-all duration-150 hover:scale-105 hover:shadow-3xl
                border border-white/20 hover:border-purple-500 flex flex-col h-full">
      <img
        [src]="project().imageUrl"
        alt="{{ project().title }}"
        class="w-full h-36 object-cover rounded-t-xl shrink-0"
        width="288" height="144" priority
      />

      <div class="p-5 flex flex-col flex-1">
        <h3 class="text-xl font-bold text-purple-300 mb-1 leading-tight line-clamp-1">{{ project().title }}</h3>
        
        <div class="mb-3">
          <p class="text-gray-300 text-sm transition-all duration-200" 
             [class.line-clamp-3]="!isExpanded()">
            {{ project().description }}
          </p>
          @if (project().description.length > 100) {
            <button 
              (click)="toggleDescription($event)"
              class="text-xs text-purple-400 hover:text-purple-300 mt-1 focus:outline-none font-medium">
              {{ isExpanded() ? 'Show less' : 'Show more' }}
            </button>
          }
        </div>

        <div class="mt-auto flex flex-col sm:flex-row justify-between gap-3 pt-4">
          @if (project().path) {
            <a
              (click)="navigateToProject()"
              class="flex-1 inline-flex items-center justify-center px-4 py-2.5
              bg-gradient-to-r from-purple-600 to-indigo-600 
              hover:from-purple-500 hover:to-indigo-500
              text-white rounded-lg cursor-pointer
              transition-all duration-200
              text-sm font-bold tracking-wide
              shadow-lg hover:shadow-purple-500/30
              transform hover:-translate-y-0.5"
              >
            <span class="material-icons text-sm mr-2">rocket_launch</span>
            Use {{project().title}}
            </a>
          }
        </div>
      </div>
    </div>
  `,
})
export class Card {
  project = input.required<Project>();
  isExpanded = signal(false);
  private router = inject(Router);

  toggleDescription(event: Event): void {
    event.stopPropagation();
    this.isExpanded.update(v => !v);
  }

  navigateToProject(): void {
    if (this.project().path) {
      this.router.navigate([this.project().path]);
    } else {
      console.warn(`No path defined for project: ${this.project().title}`);
    }
  }
}
