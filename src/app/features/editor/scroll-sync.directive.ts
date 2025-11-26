import { Directive, input, effect, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appScrollSync]',
  standalone: true
})
export class ScrollSyncDirective implements OnDestroy {
  editor = input<any>();
  preview = input<HTMLElement | null>();
  enabled = input(true);

  private isScrolling = false;
  private scrollTimeout: any;
  private editorDisposable: any;

  constructor() {
    effect(() => {
      const editorInstance = this.editor();
      const previewElement = this.preview();
      const isEnabled = this.enabled();

      // Clean up previous listeners
      this.disposeEditorListener();

      if (isEnabled && editorInstance && previewElement) {
        this.setupListeners(editorInstance, previewElement);
      }
    });
  }

  private setupListeners(editor: any, preview: HTMLElement): void {
    // Editor -> Preview
    this.editorDisposable = editor.onDidScrollChange((e: any) => {
      if (!this.isScrolling) {
        this.syncEditorToPreview(e.scrollTop, editor, preview);
      }
    });

    // Preview -> Editor
    // We need to bind the listener to the specific element instance
    const scrollHandler = () => {
      if (!this.isScrolling) {
        this.syncPreviewToEditor(preview, editor);
      }
    };
    
    preview.addEventListener('scroll', scrollHandler);
    
    // Store cleanup for preview listener (we can't easily remove anonymous listener without reference, 
    // but since we re-setup on changes, we should handle this carefully. 
    // Actually, let's attach the handler to the element property to retrieve it later or use a map if needed.
    // For simplicity with effect cleanup, we can just rely on the fact that effect runs when signals change.
    // However, effect cleanup function is better.
    
    // Let's refine the effect to return a cleanup function if possible, but effect() doesn't return cleanup in that way.
    // We'll manage cleanup manually in the effect body before setting up new ones.
    
    // Wait, adding event listener to preview element which might change is tricky.
    // Let's store the current preview element and handler to remove it later.
    (this as any)._currentPreview = preview;
    (this as any)._currentHandler = scrollHandler;
  }

  private disposeEditorListener(): void {
    if (this.editorDisposable) {
      this.editorDisposable.dispose();
      this.editorDisposable = null;
    }
    
    const prevPreview = (this as any)._currentPreview;
    const prevHandler = (this as any)._currentHandler;
    if (prevPreview && prevHandler) {
      prevPreview.removeEventListener('scroll', prevHandler);
      (this as any)._currentPreview = null;
      (this as any)._currentHandler = null;
    }
  }

  private syncEditorToPreview(scrollTop: number, editor: any, preview: HTMLElement): void {
    this.isScrolling = true;
    
    const scrollHeight = editor.getScrollHeight();
    const clientHeight = editor.getLayoutInfo().height;
    const maxScroll = scrollHeight - clientHeight;
    const scrollRatio = maxScroll > 0 ? scrollTop / maxScroll : 0;
    
    const previewMaxScroll = preview.scrollHeight - preview.clientHeight;
    const targetScroll = scrollRatio * previewMaxScroll;
    
    preview.scrollTop = targetScroll;
    
    this.resetScrollFlag();
  }

  private syncPreviewToEditor(preview: HTMLElement, editor: any): void {
    this.isScrolling = true;
    
    const scrollTop = preview.scrollTop;
    const scrollHeight = preview.scrollHeight;
    const clientHeight = preview.clientHeight;
    const maxScroll = scrollHeight - clientHeight;
    const scrollRatio = maxScroll > 0 ? scrollTop / maxScroll : 0;
    
    const editorMaxScroll = editor.getScrollHeight() - editor.getLayoutInfo().height;
    const targetScrollTop = scrollRatio * editorMaxScroll;
    
    editor.setScrollTop(targetScrollTop);
    
    this.resetScrollFlag();
  }

  private resetScrollFlag(): void {
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 100);
  }

  ngOnDestroy(): void {
    this.disposeEditorListener();
    clearTimeout(this.scrollTimeout);
  }
}
