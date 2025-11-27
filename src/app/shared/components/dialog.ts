import { Component, input, output } from '@angular/core';


@Component({
  selector: 'app-dialog',
  imports: [],
  template: `
    @if (isOpen()) {
      <div
        class="fixed backdrop-blur bg-black/30 inset-0 z-[999] flex"
        [class]="containerClass()"
        (click)="closeDialog()"
      >
        <div
          class="dialog-container flex flex-col w-full max-w-xs md:max-w-lg lg:max-w-xl"
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="dialogTitleId"
        >
          <div class="relative flex rounded-2xl p-[1.5px] overflow-hidden">
            <div class="dialog-main-content flex flex-col rounded-2xl p-4 w-full">
              <ng-content></ng-content>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .dialog-main-content {
      position: relative;
      z-index: 1;
    }
  `,
})
export class Dialog {
  isOpen = input(false);
  title = input('Dialog Title');
  containerClass = input<string>('');

  closed = output<void>();

  dialogTitleId = `dialog-title-${Math.random().toString(36).substring(2, 9)}`;

  /**
   * Closes the dialog by emitting the 'closed' event.
   */
  closeDialog(): void {
    this.closed.emit();
  }
}
