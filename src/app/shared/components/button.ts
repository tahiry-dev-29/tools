import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  template: `
    <button
      [type]="type()"
      (click)="btnClicked.emit()"
      [class]="color()"
      class="font-bold w-full px-5 py-2 rounded-xl shadow-md hover:opacity-90 cursor-pointer hover:scale-95 duration-200"
    >
      {{ label() }}
    </button>
  `,
  styles: ``,
})
export class Button {
  label = input('Button');
  color = input('bg-blue-500 text-white');
  type = input('button');
  disabled = input(false);
  btnClicked = output();
}
