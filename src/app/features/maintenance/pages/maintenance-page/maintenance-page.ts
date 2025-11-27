import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-maintenance-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="min-h-screen flex items-center justify-center p-6"
    >
      <div class="max-w-2xl w-full">
        <div
          class="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-12 text-center"
        >
          <div class="mb-8 flex justify-center">
            <div class="relative">
              <div
                class="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"
              ></div>
              <div
                class="relative bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-full"
              >
                <svg
                  class="w-16 h-16 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <h1 class="text-4xl font-bold text-white mb-4">
            Maintenance in Progress
          </h1>
          <p class="text-lg text-gray-300 mb-8 leading-relaxed">
            We are currently performing maintenance to improve your experience.
            <br />
            This feature will be back soon.
          </p>

          <div class="flex justify-center gap-2 mb-8">
            <div
              class="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style="animation-delay: 0ms"
            ></div>
            <div
              class="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
              style="animation-delay: 150ms"
            ></div>
            <div
              class="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
              style="animation-delay: 300ms"
            ></div>
          </div>
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </a>
        </div>

        <p class="text-center text-gray-200 mt-8 text-sm">
          Thank you for your patience 🙏
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class MaintenancePage {}
