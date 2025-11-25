import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Suggestion {
  trigger: string;
  suggestions: string[];
}

@Component({
  selector: 'app-suggestion-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (suggestions().length > 0) {
      <div 
        class="absolute bg-gray-800 border border-gray-700 rounded-md shadow-lg p-1"
        [style.left.px]="x()"
        [style.top.px]="y()">
        <ul>
          @for (suggestion of suggestions(); track suggestion) {
            <li 
              (click)="selectSuggestion.emit(suggestion)"
              class="px-3 py-1 hover:bg-gray-700 rounded cursor-pointer text-sm">
              {{ suggestion }}
            </li>
          }
        </ul>
      </div>
    }
  `
})
export class SuggestionPopupComponent {
  suggestions = input.required<string[]>();
  x = input<number>(0);
  y = input<number>(0);
  selectSuggestion = output<string>();
}
