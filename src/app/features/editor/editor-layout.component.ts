import { Component, signal, inject, viewChild, ElementRef } from '@angular/core';
import { MarkdownPreviewComponent } from './markdown-preview.component';
import { FormsModule } from '@angular/forms';
import { FileNode } from '../../core/models/file-node.model';
import { FileSystemService } from '../../core/services/file-system.service';
import { SuggestionPopupComponent } from './suggestion-popup.component';
import { CommonModule } from '@angular/common';
import { FileTreeComponent } from './file-explorer/file-tree.component';

@Component({
  selector: 'app-editor-layout',
  standalone: true,
  imports: [CommonModule, MarkdownPreviewComponent, FormsModule, FileTreeComponent, SuggestionPopupComponent],
  template: `
    <div class="flex h-screen bg-gray-900 text-white overflow-hidden">
    
      <div class="w-64 flex-shrink-0 h-full border-r border-gray-800">
        <app-file-tree (fileSelected)="onFileSelected($event)" />
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex h-full min-w-0">
        <!-- Editor -->
        <div class="w-1/2 h-full flex flex-col border-r border-gray-800 relative">
          <div class="bg-gray-950 px-4 py-2 text-xs text-gray-500 border-b border-gray-800 uppercase tracking-wider font-bold">
            Editor
          </div>
          <textarea
            #editor
            class="flex-1 w-full bg-gray-900 text-gray-300 p-4 font-mono resize-none focus:outline-none focus:ring-0 text-sm leading-relaxed"
            [(ngModel)]="rawContent"
            (ngModelChange)="onContentChange()"
            (keydown.enter)="onEnter($event)"
            placeholder="Start writing...">
          </textarea>
          @if (showSuggestions()) {
            <app-suggestion-popup
              [suggestions]="suggestions()"
              [x]="suggestionPopupX()"
              [y]="suggestionPopupY()"
              (selectSuggestion)="onSuggestionSelected($event)">
            </app-suggestion-popup>
          }
        </div>

        <!-- Preview -->
        <div class="w-1/2 h-full flex flex-col">
          <div class="bg-gray-950 px-4 py-2 text-xs text-gray-500 border-b border-gray-800 uppercase tracking-wider font-bold">
            Preview
          </div>
          <div class="flex-1 overflow-hidden relative">
             <app-markdown-preview [content]="rawContent()" />
          </div>
        </div>
      </div>
    </div>
  `
})
export class EditorLayoutComponent {
  private fileSystemService = inject(FileSystemService);
  
  rawContent = signal<string>('# Welcome to ObsidianWeb 2026\n\nOpen a folder to start editing files.');
  currentFileHandle = signal<FileSystemFileHandle | null>(null);

  editor = viewChild.required<ElementRef<HTMLTextAreaElement>>('editor');

  showSuggestions = signal(false);
  suggestions = signal<string[]>([]);
  suggestionPopupX = signal(0);
  suggestionPopupY = signal(0);
  private suggestionTrigger = ':';
  private emojiSuggestions = ['+1', '-1', 'smile', 'tada', 'thinking_face', 'heart'];


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

  onContentChange(): void {
    const content = this.rawContent();
    const editorEl = this.editor().nativeElement;
    const cursorPos = editorEl.selectionStart;
    const textUpToCursor = content.substring(0, cursorPos);
    const triggerIndex = textUpToCursor.lastIndexOf(this.suggestionTrigger);
    console.log('triggerIndex', triggerIndex);

    if (triggerIndex > -1) {
      const query = textUpToCursor.substring(triggerIndex + 1);
      console.log('query', query);
      // Check if there is a space after the trigger
      if (!query.includes(' ')) {
        const filteredSuggestions = this.emojiSuggestions.filter(s => s.startsWith(query));
        console.log('filteredSuggestions', filteredSuggestions);
        this.suggestions.set(filteredSuggestions);
        this.showSuggestions.set(filteredSuggestions.length > 0);
        
        // Naive implementation for popup position.
        // A real implementation would need to calculate the cursor's pixel position.
        const { top, left } = editorEl.getBoundingClientRect();
        this.suggestionPopupX.set(left + 20);
        this.suggestionPopupY.set(top + 50);

      } else {
        this.showSuggestions.set(false);
      }
    } else {
      this.showSuggestions.set(false);
    }
  }

  onSuggestionSelected(suggestion: string): void {
    const editorEl = this.editor().nativeElement;
    const cursorPos = editorEl.selectionStart;
    const textUpToCursor = this.rawContent().substring(0, cursorPos);
    const triggerIndex = textUpToCursor.lastIndexOf(this.suggestionTrigger);
    
    const textBefore = this.rawContent().substring(0, triggerIndex);
    const textAfter = this.rawContent().substring(cursorPos);
    
    const newContent = `${textBefore}:${suggestion}: ${textAfter}`;
    this.rawContent.set(newContent);
    this.showSuggestions.set(false);

    // Move cursor after the inserted suggestion
    const newCursorPos = (textBefore + `:${suggestion}: `).length;
    setTimeout(() => {
      editorEl.focus();
      editorEl.setSelectionRange(newCursorPos, newCursorPos);
    });
  }

  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (this.showSuggestions()) {
      keyboardEvent.preventDefault();
      // For now, we'll just insert the first suggestion
      if (this.suggestions().length > 0) {
        this.onSuggestionSelected(this.suggestions()[0]);
      }
    }
  }

  // TODO: Implement save functionality
  async saveContent(): Promise<void> {
    const handle = this.currentFileHandle();
    if (handle) {
      await this.fileSystemService.writeFile(handle, this.rawContent());
    }
  }
}
