import { Component, effect, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Project } from '../../core/models/project';
import { ProjectListsService } from '../../core/services/projectLists-service';
import { SearchHistoryService } from '../../core/services/search-history-service';
import { ScrollHide } from '../directives/scroll-hide';
import { Dialog } from './dialog';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [RouterLink, ScrollHide, Dialog],
  template: `
    <nav
      appScrollHide #scrollHide="appScrollHide"
      class="fixed top-0 left-0 right-0 z-50
             bg-gray-800/50 backdrop-blur-md text-white w-11/12 mx-auto p-4 shadow-xl border-b border-gray-800
             flex items-center justify-between px-10 mt-5 rounded-full
             transform transition-transform duration-300 ease-in-out"
      [class.-translate-y-[300%]]="!scrollHide.visible()"
      [class.translate-y-0]="scrollHide.visible()"
    >
      <div class="flex items-center">
        <a routerLink="/home" class="flex items-center gap-2 group">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="toolsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="8" fill="url(#toolsGradient)" />
            <path d="M12 20L16 16M16 16L20 20M16 16V28" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
            <path d="M24 12L28 16M28 16L24 20M28 16H20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
            <circle cx="28" cy="28" r="3" stroke="white" stroke-width="2" fill="none" opacity="0.9"/>
          </svg>
          <span class="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-purple-300 transition-all duration-300">
            Tools
          </span>
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
      [title]="''"
      [containerClass]="'items-start justify-center p-4 pt-16'"
    (closed)="onSearchDialogClosed()"
    >
    <div class="w-full max-w-2xl flex flex-col gap-0 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
      <div class="p-4 border-b border-gray-800">
        <input
          #searchInput
          type="text"
          placeholder="Search docs"
          class="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 transition-all duration-300 ease-in-out text-sm"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          (keydown)="onKeyDown($event)"
        />
      </div>

      <div class="max-h-96 overflow-y-auto">
        @if (searchQuery().length === 0 && recentSearches().length > 0) {
          <div class="p-2">
            <div class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Recent
            </div>
            @for (item of recentSearches(); track item.id; let i = $index) {
              <div
                class="flex items-center justify-between px-3 py-2.5 mx-2 rounded-lg transition-colors cursor-pointer group"
                [class.bg-gray-800]="selectedIndex() === i"
                (click)="selectItem(item.path)"
                (mouseenter)="selectedIndex.set(i)"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="material-icons text-gray-500 text-lg">history</span>
                  <span class="text-sm text-gray-200 truncate">{{ item.title }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    (click)="toggleFavorite(item.id, $event)"
                    class="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span class="material-icons text-sm" [class.text-yellow-400]="item.isFavorite" [class.text-gray-500]="!item.isFavorite">
                      {{ item.isFavorite ? 'star' : 'star_border' }}
                    </span>
                  </button>
                  <button
                    (click)="removeRecent(item.id, $event)"
                    class="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span class="material-icons text-sm text-gray-500">close</span>
                  </button>
                </div>
              </div>
            }
          </div>
        }

        @if (searchQuery().length > 0 && filteredProjects().length > 0) {
          <div class="p-2">
            @for (project of filteredProjects(); track project.id; let i = $index) {
              <div
                class="flex items-center justify-between px-3 py-2.5 mx-2 rounded-lg transition-colors cursor-pointer group"
                [class.bg-gray-800]="selectedIndex() === i"
                (click)="selectItem(project.path)"
                (mouseenter)="selectedIndex.set(i)"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="material-icons text-gray-500 text-lg">description</span>
                  <div class="flex flex-col min-w-0">
                    <span class="text-sm text-gray-200 truncate">{{ project.title }}</span>
                    <span class="text-xs text-gray-500 truncate">{{ project.description }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else if (searchQuery().length > 0 && filteredProjects().length === 0) {
          <div class="p-6 text-center text-sm text-gray-500">
            No projects found.
          </div>
        }
      </div>

      <div class="px-4 py-3 border-t border-gray-800 bg-gray-900/50 flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1">
            <kbd class="px-2 py-1 bg-gray-800 rounded border border-gray-700">↑</kbd>
            <kbd class="px-2 py-1 bg-gray-800 rounded border border-gray-700">↓</kbd>
            <span>to navigate</span>
          </div>
          <div class="flex items-center gap-1">
            <kbd class="px-2 py-1 bg-gray-800 rounded border border-gray-700">↵</kbd>
            <span>to select</span>
          </div>
          <div class="flex items-center gap-1">
            <kbd class="px-2 py-1 bg-gray-800 rounded border border-gray-700">esc</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
    </app-dialog>
  `,
  styles: [`
    kbd {
      font-family: ui-monospace, monospace;
      font-size: 0.75rem;
    }
  `],
})
export class NavMenu {
  isSearchVisible = signal(false);
  searchQuery = signal('');
  selectedIndex = signal(0);

  searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  private projectService = inject(ProjectListsService);
  private searchHistory = inject(SearchHistoryService);
  private router = inject(Router);

  filteredProjects = signal<Project[]>([]);
  recentSearches = this.searchHistory.recentSearches;
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
          this.selectedIndex.set(0);
        }, 300);
      } else {
        this.filteredProjects.set([]);
        this.selectedIndex.set(0);
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
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.toggleSearchDialog();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const items = this.searchQuery().length > 0 ? this.filteredProjects() : this.recentSearches();
    const maxIndex = items.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.update(i => Math.min(i + 1, maxIndex));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (items.length > 0) {
          const selected = items[this.selectedIndex()];
          this.selectItem(selected.path);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.onSearchDialogClosed();
        break;
    }
  }

  selectItem(path: string): void {
    const project = this.projectService.projects().find(p => p.path === path);
    if (project) {
      this.searchHistory.addSearch(project.title, project.path);
      this.router.navigate([path]);
      this.onSearchDialogClosed();
    }
  }

  toggleFavorite(id: string, event: Event): void {
    event.stopPropagation();
    this.searchHistory.toggleFavorite(id);
  }

  removeRecent(id: string, event: Event): void {
    event.stopPropagation();
    this.searchHistory.removeSearch(id);
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
    this.selectedIndex.set(0);
  }

  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery.set(inputElement.value);
  }
}
