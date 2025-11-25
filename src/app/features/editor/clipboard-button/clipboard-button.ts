import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clipboard-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="copy-button"
      [class.copied]="copied()"
      (click)="copyToClipboard()"
      title="Copy code">
      <span class="material-icons">{{ copied() ? 'check' : 'content_copy' }}</span>
    </button>
  `,
  styles: [`
    .copy-button {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s, background-color 0.2s;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    :host:hover .copy-button,
    .copy-button:focus {
      opacity: 1;
    }

    .copy-button:hover {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
    }

    .copy-button.copied {
      opacity: 1;
      color: var(--accent-color);
    }

    .copy-button .material-icons {
      font-size: 16px;
    }
  `]
})
export class ClipboardButtonComponent {
  content = input.required<string>();
  copied = signal(false);

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.content());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
}
