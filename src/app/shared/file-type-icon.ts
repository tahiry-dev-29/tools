import { Component, input } from '@angular/core';

export type FileTypeIcon = 'image' | 'video' | 'pdf' | 'docx' | 'txt' | 'markdown';

@Component({
  selector: 'app-file-type-icon',
  standalone: true,
  template: `
    <div class="icon-wrapper" [attr.data-type]="type()">
      @switch (type()) {
        @case ('image') {
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#10b981"/>
            <path d="M9 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="#fff"/>
            <path d="M21 15l-5-5-6 6-3-3-4 4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          </svg>
        }
        @case ('video') {
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="5" width="18" height="14" rx="2" fill="#f59e0b"/>
            <path d="M10 8.5l6 3.5-6 3.5V8.5z" fill="#fff"/>
          </svg>
        }
        @case ('pdf') {
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#ef4444"/>
            <path d="M14 2v6h6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="12" y="16" text-anchor="middle" fill="#fff" font-size="6" font-weight="bold">PDF</text>
          </svg>
        }
        @case ('docx') {
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#2563eb"/>
            <path d="M14 2v6h6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 12h8M8 16h8" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        }
        @case ('txt') {
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#6366f1"/>
            <path d="M14 2v6h6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 10h8M8 14h8M8 18h5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        }
        @case ('markdown') {
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="5" width="18" height="14" rx="2" fill="#8b5cf6"/>
            <path d="M7 15V9l2 2 2-2v6M17 11l-2 4h4l-2-4z" fill="#fff"/>
          </svg>
        }
      }
    </div>
  `,
  styles: [`
    .icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      transition: transform 0.2s ease;
    }

    .icon-wrapper:hover {
      transform: scale(1.1);
    }

    svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    /* Color variations for each type */
    [data-type="image"] svg { }
    [data-type="video"] svg { }
    [data-type="pdf"] svg { }
    [data-type="docx"] svg { }
    [data-type="txt"] svg { }
    [data-type="markdown"] svg { }
  `]
})
export class FileTypeIconComponent {
  type = input.required<FileTypeIcon>();
}
