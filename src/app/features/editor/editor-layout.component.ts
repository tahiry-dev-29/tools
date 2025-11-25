import { Component, signal, inject } from '@angular/core';
import { MarkdownPreviewComponent } from './markdown-preview.component';
import { FormsModule } from '@angular/forms';
import { FileNode } from '../../core/models/file-node.model';
import { FileSystemService } from '../../core/services/file-system.service';
import { CommonModule } from '@angular/common';
import { FileTreeComponent } from './file-explorer/file-tree.component';
import { MonacoEditorModule, NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';
import { MarkdownCompletionService } from './markdown-completion.service';

@Component({
  selector: 'app-editor-layout',
  standalone: true,
  imports: [CommonModule, MarkdownPreviewComponent, FormsModule, FileTreeComponent, MonacoEditorModule],
  template: `
    <div class="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans">
    
      <div 
        [class]="sidebarCollapsed() ? 'w-0' : 'w-64'" 
        class="flex-shrink-0 h-full border-r border-[var(--border-color)] bg-[var(--bg-secondary)] transition-all duration-300 overflow-hidden">
        <app-file-tree (fileSelected)="onFileSelected($event)" />
      </div>

      <div class="flex-1 flex flex-col h-full min-w-0">
        <div class="flex items-center bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] px-2 py-1">
          <button 
            (click)="toggleSidebar()" 
            class="p-1 hover:bg-[var(--bg-secondary)] rounded transition-colors mr-2"
            [title]="sidebarCollapsed() ? 'Show sidebar' : 'Hide sidebar'">
            <span class="material-icons text-sm">{{ sidebarCollapsed() ? 'menu_open' : 'menu' }}</span>
          </button>
          <button 
            (click)="toggleReadingMode()" 
            class="p-1 hover:bg-[var(--bg-secondary)] rounded transition-colors"
            [title]="readingMode() ? 'Show editor' : 'Reading mode'">
            <span class="material-icons text-sm">{{ readingMode() ? 'edit' : 'chrome_reader_mode' }}</span>
          </button>
          <div class="flex-1"></div>
          <span class="text-[10px] text-[var(--text-secondary)] opacity-50">{{ readingMode() ? 'Reading Mode' : 'Edit Mode' }}</span>
        </div>

        <div class="flex flex-1 h-full min-w-0">
          <div 
            [class]="readingMode() ? 'w-0' : 'w-1/2'" 
            class="h-full flex flex-col border-r border-[var(--border-color)] relative transition-all duration-300 overflow-hidden">
            <div class="bg-[var(--bg-tertiary)] px-4 py-2 text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase tracking-wider font-bold">
              Editor
            </div>
            <ngx-monaco-editor
              class="flex-1 w-full"
              [options]="editorOptions"
              [(ngModel)]="rawContent"
              (onInit)="onEditorInit()"
            ></ngx-monaco-editor>
          </div>

          <div class="flex-1 h-full flex flex-col bg-[var(--bg-primary)] transition-all duration-300">
            <div class="bg-[var(--bg-tertiary)] px-4 py-2 text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase tracking-wider font-bold">
              Preview
            </div>
            <div class="flex-1 overflow-hidden relative p-6">
               <app-markdown-preview [content]="rawContent()" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EditorLayoutComponent {
  private fileSystemService = inject(FileSystemService);
  private markdownCompletionService = inject(MarkdownCompletionService);
  
  rawContent = signal<string>('# Welcome to ObsidianWeb 2026\n\nOpen a folder to start editing files.');
  currentFileHandle = signal<FileSystemFileHandle | null>(null);
  sidebarCollapsed = signal(false);
  readingMode = signal(false);

  editorOptions = {
    theme: 'vs-dark',
    language: 'markdown',
    minimap: { enabled: false },
    lineNumbers: 'off',
    wordWrap: 'on',
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
  };

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleReadingMode(): void {
    this.readingMode.update(v => !v);
  }

  onEditorInit(): void {
    this.markdownCompletionService.registerCompletionProvider();
  }

  async onFileSelected(node: FileNode): Promise<void> {
    if (node.kind === 'file') {
      try {
        const handle = node.handle as FileSystemFileHandle;
        this.currentFileHandle.set(handle);
        const content = await this.fileSystemService.readFile(handle);
        this.rawContent.set(content);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  }

  async saveContent(): Promise<void> {
    const handle = this.currentFileHandle();
    if (handle) {
      await this.fileSystemService.writeFile(handle, this.rawContent());
    }
  }
}
