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
    
      <div class="w-64 flex-shrink-0 h-full border-r border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <app-file-tree (fileSelected)="onFileSelected($event)" />
      </div>

      <div class="flex-1 flex h-full min-w-0">
        <div class="w-1/2 h-full flex flex-col border-r border-[var(--border-color)] relative">
          <div class="bg-[var(--bg-tertiary)] px-4 py-2 text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase tracking-wider font-bold flex items-center justify-between">
            <span>Editor</span>
            <span class="text-[10px] opacity-50">Markdown</span>
          </div>
          <ngx-monaco-editor
            class="flex-1 w-full"
            [options]="editorOptions"
            [(ngModel)]="rawContent"
            (onInit)="onEditorInit()"
          ></ngx-monaco-editor>
        </div>

        <div class="w-1/2 h-full flex flex-col bg-[var(--bg-primary)]">
          <div class="bg-[var(--bg-tertiary)] px-4 py-2 text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase tracking-wider font-bold flex items-center justify-between">
            <span>Preview</span>
            <span class="text-[10px] opacity-50">Live</span>
          </div>
          <div class="flex-1 overflow-hidden relative p-6">
             <app-markdown-preview [content]="rawContent()" />
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

  editorOptions = {
    theme: 'vs-dark',
    language: 'markdown',
    minimap: { enabled: false },
    lineNumbers: 'off',
    wordWrap: 'on',
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
  };

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
