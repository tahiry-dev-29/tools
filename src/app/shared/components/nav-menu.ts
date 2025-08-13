import { Component, ElementRef, HostListener, signal, viewChild, inject, effect } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ProjectListsService } from '../../core/services/projectLists-service';
import { ScrollHide } from '../directives/scroll-hide';
import { Dialog } from './dialog';
import {Project} from '../../core/models/project';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [RouterLink, ScrollHide, Dialog],
  template: `
    <nav
      appScrollHide #scrollHide="appScrollHide"
      class="fixed top-0 left-0 right-0 z-50
             bg-gray-900/70 backdrop-blur-md text-white p-4 shadow-xl border-b border-gray-800
             flex items-center justify-between
             transform transition-transform duration-300 ease-in-out"
      [class.-translate-y-full]="!scrollHide.visible()"
      [class.translate-y-0]="scrollHide.visible()"
    >
      <div class="flex items-center">
        <a routerLink="/home" class="text-2xl font-extrabold text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
          Logo
        </a>
      </div>

      <button (click)="toggleSearchDialog()" class="flex justify-between items-center gap-2 sm:gap-4 cursor-pointer p-2 bg-white/25 backdrop-blur-2xl rounded-2xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 relative overflow-hidden group" aria-label="Toggle search">
        <div class="text-md text-gray-300 font-bold bg-gray-400/90 p-1 rounded-lg hidden sm:block">
          ⌘K
        </div>
        <span class="material-icons">
            search
          </span>
      </button>
    </nav>

    <app-dialog
      [isOpen]="isSearchVisible()"
      [title]="'Search Projects'"
      [containerClass]="'items-start justify-center p-4 pt-16'"
    (closed)="onSearchDialogClosed()"
    >
    <div class="w-full flex flex-col gap-4">
      <input
        #searchInput
        type="text"
        placeholder="Search projects..."
        class="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400
                 focus:outline-none focus:ring-2 focus:ring-indigo-500
                 transition-all duration-300 ease-in-out"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
      />

      <!-- Search Results Dropdown -->
      @if (searchQuery().length > 0 && filteredProjects().length > 0) {
        <div class="bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          @for (project of filteredProjects(); track project.id) {
            <a
              [routerLink]="project.path"
              (click)="onSearchDialogClosed()"
              class="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors duration-150"
            >
              {{ project.title }}
            </a>
          }
        </div>
      } @else if (searchQuery().length > 0 && filteredProjects().length === 0) {
        <div class="bg-gray-800 rounded-lg shadow-lg p-3 text-sm text-gray-400">
          No projects found.
        </div>
      }
    </div>
    </app-dialog>
  `,
  styles: [`
    /* No custom CSS needed here, all handled by Tailwind */
  `],
})
export class NavMenu {
  isSearchVisible = signal(false);
  searchQuery = signal('');

  searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  private projectService = inject(ProjectListsService);

  filteredProjects = signal<Project[]>([]);
  private scrollTimeout: any;

  constructor() {
    effect(() => {
      const query = this.searchQuery().toLowerCase();
      if (query.length > 0) {
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        this.scrollTimeout = setTimeout(() => {
          this.filteredProjects.set(
            this.projectService.projects().filter(project =>
              project.title.toLowerCase().includes(query) ||
              project.description.toLowerCase().includes(query)
            )
          );
        }, 300);
      } else {
        this.filteredProjects.set([]);
      }
    });

    effect(() => {
      if (this.isSearchVisible()) {
        setTimeout(() => this.searchInput().nativeElement.focus(), 0);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      this.toggleSearchDialog();
    }
  }

  toggleSearchDialog(): void {
    this.isSearchVisible.update(current => !current);
    if (!this.isSearchVisible()) {
      this.searchQuery.set('');
    }
  }

  onSearchDialogClosed(): void {
    this.isSearchVisible.set(false);
    this.searchQuery.set('');
  }

  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery.set(inputElement.value);
  }
}
