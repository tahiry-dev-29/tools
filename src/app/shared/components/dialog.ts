import { Component, input, output } from '@angular/core';


@Component({
  selector: 'app-dialog',
  imports: [],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 bg-black/50 z-[999] flex"
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
          <div class="dialog-border-effect relative flex rounded-2xl p-[1.5px] overflow-hidden">
            <div class="dialog-main-content flex flex-col bg-[#363636] rounded-2xl p-4 w-full">
              <!-- Dialog Header -->
              <div class="flex justify-between items-center mb-4">
                <h2 [id]="dialogTitleId" class="text-lg font-semibold text-white">{{ title() }}</h2>
                <button
                  (click)="closeDialog()"
                  class="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label="Close dialog"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div class="text-white text-sm">
                <ng-content></ng-content>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .dialog-border-effect {
      background: linear-gradient(
        to bottom right,
        #7e7e7e,
        #363636,
        #363636,
        #363636,
        #363636
      );
    }

    .dialog-border-effect::after {
      position: absolute;
      content: "";
      top: -10px;
      left: -10px;
      background: radial-gradient(
        ellipse at center,
        #ffffff,
        rgba(255, 255, 255, 0.3),
        rgba(255, 255, 255, 0.1),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0)
      );
      filter: blur(1px);
      z-index: 0;
    }

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
