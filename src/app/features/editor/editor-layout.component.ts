import { CommonModule } from '@angular/common';
import { Component, inject, signal, viewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FileNode } from '../../core/models/file-node.model';
import { FileSystemService } from '../../core/services/file-system-service';
import { FileTreeComponent } from './file-explorer/file-tree.component';
import { MarkdownCompletionService } from './markdown-completion-service';
import { MarkdownPreviewComponent } from './markdown-preview.component';
import { ScrollSyncDirective } from './scroll-sync.directive';

@Component({
  selector: 'app-editor-layout',
  standalone: true,
  imports: [CommonModule, MarkdownPreviewComponent, FormsModule, FileTreeComponent, MonacoEditorModule, ScrollSyncDirective],
  template: `
    <div class="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans"
         appScrollSync
         [editor]="monacoEditor"
         [preview]="previewComponent()?.getScrollElement()"
         [enabled]="scrollSyncEnabled()">
    
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
          <button 
            (click)="toggleSync()" 
            class="p-1 hover:bg-[var(--bg-secondary)] rounded transition-colors ml-2"
            [class.text-blue-400]="scrollSyncEnabled()"
            [title]="scrollSyncEnabled() ? 'Disable scroll sync' : 'Enable scroll sync'">
            <span class="material-icons text-sm">sync</span>
          </button>
          <div class="flex-1"></div>
          <span class="text-[10px] text-[var(--text-secondary)] opacity-50">{{ readingMode() ? 'Reading Mode' : 'Edit Mode' }}</span>
        </div>

        <div #resizeContainer class="flex flex-1 h-full min-w-0">
          <div 
            [class.w-0]="readingMode()"
            [class.pointer-events-none]="isResizing()"
            [class.transition-all]="!isResizing()"
            [class.duration-300]="!isResizing()"
            [style.width.%]="readingMode() ? 0 : editorWidth()"
            class="flex-none h-full flex flex-col border-r border-[var(--border-color)] relative overflow-hidden">
            <div class="bg-[var(--bg-tertiary)] px-4 py-2 text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase tracking-wider font-bold">
              Editor
            </div>
            <ngx-monaco-editor
              class="flex-1 w-full"
              [options]="editorOptions"
              [(ngModel)]="rawContent"
              (onInit)="onEditorInit($event)"
            ></ngx-monaco-editor>
          </div>


           @if (!readingMode()) {
          <div 
            class="w-1 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition-colors z-10"
            [class.bg-blue-500]="isResizing()"
            (mousedown)="startResizing($event)">
          </div>
          }

          <div 
            [class.pointer-events-none]="isResizing()"
            [class.transition-all]="!isResizing()"
            [class.duration-300]="!isResizing()"
            class="flex-1 h-full flex flex-col bg-[var(--bg-primary)]">
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
  
  rawContent = signal<string>('# Welcome to Markdown Editor Web 2026\n\nOpen a folder to start editing files.');
  currentFileHandle = signal<FileSystemFileHandle | null>(null);
  sidebarCollapsed = signal(false);
  readingMode = signal(false);
  scrollSyncEnabled = signal(true);
  

  editorWidth = signal(50);
  isResizing = signal(false);
  
  previewComponent = viewChild(MarkdownPreviewComponent);
  resizeContainer = viewChild<ElementRef>('resizeContainer');
  monacoEditor: any = null;

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

  onEditorInit(editor: any): void {
    this.monacoEditor = editor;
    this.markdownCompletionService.registerCompletionProvider();
  }


  startResizing(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing.set(true);
    

    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.stopResizing);
  }

  onMouseMove = (event: MouseEvent): void => {
    if (!this.isResizing()) return;
    
    const container = this.resizeContainer();
    if (!container) return;
    
    const rect = container.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const containerWidth = rect.width;
    
    let newWidth = (mouseX / containerWidth) * 100;
    

    newWidth = Math.max(5, Math.min(95, newWidth));
    
    this.editorWidth.set(newWidth);
    

    if (this.monacoEditor) {
      this.monacoEditor.layout();
    }
  }

  stopResizing = (): void => {
    this.isResizing.set(false);

    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.stopResizing);
  }

  toggleSync(): void {
    this.scrollSyncEnabled.update(v => !v);
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
