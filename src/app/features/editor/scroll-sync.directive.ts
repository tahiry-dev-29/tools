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

      this.disposeEditorListener();

      if (isEnabled && editorInstance && previewElement) {
        this.setupListeners(editorInstance, previewElement);
      }
    });
  }

  private setupListeners(editor: any, preview: HTMLElement): void {
    this.editorDisposable = editor.onDidScrollChange((e: any) => {
      if (!this.isScrolling) {
        this.syncEditorToPreview(e.scrollTop, editor, preview);
      }
    });

    const scrollHandler = () => {
      if (!this.isScrolling) {
        this.syncPreviewToEditor(preview, editor);
      }
    };
    
    preview.addEventListener('scroll', scrollHandler);
    
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
