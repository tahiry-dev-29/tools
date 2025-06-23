import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  template: `
  <p>{{title}}</p>
    `,
  styleUrl: './app.scss'
})
export class App {
  protected title = 'tools';
}
