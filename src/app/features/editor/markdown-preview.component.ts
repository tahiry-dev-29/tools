import { Component, input, effect, inject } from '@angular/core';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-markdown-preview',
  standalone: true,
  imports: [MarkdownModule],
  template: `
    <div class="prose prose-invert max-w-none p-4 h-full overflow-y-auto">
      <markdown
        [data]="content()"
        (ready)="onReady()">
      </markdown>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class MarkdownPreviewComponent {
  content = input.required<string>();

  private markdownService = inject(MarkdownService);

  constructor() {
    effect(() => {
      // Logic to handle auto-scroll or specific post-processing
    });
  }

  onReady(): void {
    // e.g., Hijack internal links to prevent page reload
    this.attachInternalLinkListeners();
  }

  private attachInternalLinkListeners(): void {
    // Implementation to handle [[WikiLinks]] clicks
  }
}
