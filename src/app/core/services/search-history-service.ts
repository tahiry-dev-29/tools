import { Injectable, signal } from '@angular/core';

interface SearchHistoryItem {
  id: string;
  title: string;
  path: string;
  timestamp: number;
  isFavorite?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SearchHistoryService {
  private readonly STORAGE_KEY = 'search_history';
  private readonly MAX_ITEMS = 10;

  private _recentSearches = signal<SearchHistoryItem[]>([]);
  recentSearches = this._recentSearches.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  addSearch(title: string, path: string): void {
    const existing = this._recentSearches().find(item => item.path === path);
    
    if (existing) {
      const updated = this._recentSearches().map(item =>
        item.path === path ? { ...item, timestamp: Date.now() } : item
      );
      this._recentSearches.set(this.sortByTimestamp(updated));
    } else {
      const newItem: SearchHistoryItem = {
        id: crypto.randomUUID(),
        title,
        path,
        timestamp: Date.now()
      };
      
      const updated = [newItem, ...this._recentSearches()].slice(0, this.MAX_ITEMS);
      this._recentSearches.set(updated);
    }
    
    this.saveToStorage();
  }

  removeSearch(id: string): void {
    this._recentSearches.update(items => items.filter(item => item.id !== id));
    this.saveToStorage();
  }

  toggleFavorite(id: string): void {
    this._recentSearches.update(items =>
      items.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
    this.saveToStorage();
  }

  clearHistory(): void {
    this._recentSearches.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const items = JSON.parse(stored) as SearchHistoryItem[];
        this._recentSearches.set(this.sortByTimestamp(items));
      } catch (e) {
        console.error('Failed to load search history', e);
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._recentSearches()));
  }

  private sortByTimestamp(items: SearchHistoryItem[]): SearchHistoryItem[] {
    return [...items].sort((a, b) => b.timestamp - a.timestamp);
  }
}
