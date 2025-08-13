import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-white">
      <h1 class="text-9xl font-bold text-red-600">404</h1>
      <h2 class="text-3xl md:text-4xl font-semibold mt-4 mb-2">Page Not Found</h2>
      <p class="text-lg text-center max-w-md mb-6">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <a
        routerLink="/home"
        class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out"
      >
        Go to Home
      </a>
    </div>
  `,
})
export class NotFound {

}
