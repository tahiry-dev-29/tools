import { Component, input, output, effect, inject, ElementRef, afterNextRender, viewChild } from '@angular/core';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-markdown-preview',
  standalone: true,
  imports: [MarkdownModule],
  template: `
    <div #previewContainer class="markdown-preview h-full overflow-y-auto" (scroll)="onScroll()">
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
  scrolled = output<void>();
  
  previewContainer = viewChild<ElementRef>('previewContainer');
  
  private elementRef = inject(ElementRef);
  private markdownService = inject(MarkdownService);

  constructor() {
    afterNextRender(() => {
      this.addCopyButtons();
    });

    effect(() => {
      this.content();
      setTimeout(() => this.addCopyButtons(), 100);
    });
  }

  onReady(): void {
    this.addCopyButtons();
    this.attachInternalLinkListeners();
  }

  private addCopyButtons(): void {
    const preElements = this.elementRef.nativeElement.querySelectorAll('pre');
    preElements.forEach((pre: HTMLElement) => {
      const existingButton = pre.querySelector('.copy-code-button');
      if (existingButton) {
        existingButton.remove();
      }

      const button = document.createElement('button');
      button.className = 'copy-code-button';
      button.innerHTML = '<span class="material-icons">content_copy</span>';
      button.title = 'Copy code';

      button.addEventListener('click', () => {
        const code = pre.querySelector('code');
        if (code) {
          navigator.clipboard.writeText(code.textContent || '').then(() => {
            button.innerHTML = '<span class="material-icons">check</span>';
            button.classList.add('copied');
            setTimeout(() => {
              button.innerHTML = '<span class="material-icons">content_copy</span>';
              button.classList.remove('copied');
            }, 2000);
          }).catch(err => {
            console.error('Failed to copy:', err);
          });
        }
      });

      pre.appendChild(button);
    });
  }

  private attachInternalLinkListeners(): void {
  }

  onScroll(): void {
    this.scrolled.emit();
  }

  getScrollElement(): HTMLElement | null {
    const container = this.previewContainer();
    return container ? container.nativeElement : null;
  }
}
