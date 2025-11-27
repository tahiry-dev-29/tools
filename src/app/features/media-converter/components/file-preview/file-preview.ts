import { Component, input, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-file-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preview-container mt-4 mb-4 p-4 bg-black/20 rounded-lg">
      @switch (previewType()) {
        @case ('image') {
          <img [src]="fileUrl()" class="max-h-64 mx-auto rounded shadow-lg object-contain" alt="Preview">
        }
        @case ('video') {
          <video [src]="fileUrl()" controls class="max-h-64 mx-auto rounded shadow-lg"></video>
        }
        @case ('audio') {
          <div class="flex flex-col items-center justify-center p-8 bg-gray-800 rounded">
            <span class="material-icons text-4xl mb-2 text-gray-400">audiotrack</span>
            <audio [src]="fileUrl()" controls class="w-full"></audio>
          </div>
        }
        @case ('text') {
          <div class="max-h-64 overflow-auto p-4 bg-gray-900 rounded border border-gray-700 font-mono text-xs text-gray-300 whitespace-pre-wrap">
            {{ textContent() }}
          </div>
        }
        @case ('pdf') {
          <div class="flex flex-col items-center justify-center p-8 bg-gray-800 rounded border border-gray-700">
            <span class="material-icons text-4xl mb-2 text-red-400">picture_as_pdf</span>
            <p class="text-sm text-gray-400">Aperçu PDF non disponible</p>
          </div>
        }
        @default {
          <div class="flex flex-col items-center justify-center p-8 bg-gray-800 rounded border border-gray-700">
            <span class="material-icons text-4xl mb-2 text-gray-500">insert_drive_file</span>
            <p class="text-sm text-gray-400">Pas d'aperçu disponible</p>
          </div>
        }
      }
    </div>
  `
})
export class FilePreviewComponent {
  file = input.required<File>();
  
  previewType = computed(() => {
    const f = this.file();
    if (f.type.startsWith('image/')) return 'image';
    if (f.type.startsWith('video/')) return 'video';
    if (f.type.startsWith('audio/')) return 'audio';
    if (f.type === 'application/pdf') return 'pdf';
    if (f.type === 'text/plain' || f.name.endsWith('.md') || f.name.endsWith('.txt') || f.name.endsWith('.html')) return 'text';
    return 'unknown';
  });

  fileUrl = computed(() => {
    const f = this.file();
    return URL.createObjectURL(f);
  });

  textContent = signal<string>('');

  constructor() {
    effect(() => {
      const f = this.file();
      if (this.previewType() === 'text') {
        f.text().then(text => this.textContent.set(text.slice(0, 1000) + (text.length > 1000 ? '...' : '')));
      }
    });
  }
}
