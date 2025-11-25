import { Directive, HostListener, signal, WritableSignal } from '@angular/core';

@Directive({
  selector: '[appScrollHide]',
  exportAs: 'appScrollHide'
})
export class ScrollHide {
  visible: WritableSignal<boolean> = signal(true);

  private lastScrollY = 0;

  /**
   * Listens for the window's scroll event.
   * Determines if the host element should be visible based on scroll direction and position.
   */
  @HostListener('window:scroll')
  onWindowScroll(): void {
    const currentScrollY = window.scrollY;

    if (currentScrollY === 0) {
      this.visible.set(true);
    } else if (currentScrollY > this.lastScrollY && currentScrollY > 50) {
      this.visible.set(false);
    } else if (currentScrollY < this.lastScrollY) {
      this.visible.set(true);
    }
    this.lastScrollY = currentScrollY;
  }
}
