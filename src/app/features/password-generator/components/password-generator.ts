import {CommonModule} from '@angular/common';
import {Component, inject, signal} from '@angular/core';
import {PasswordGeneratorService} from '../services/passwordGenerator-service';
import {Button} from '../../../shared/components/button';

@Component({
  selector: 'app-password-generator',
  imports: [CommonModule, Button],
  template: `
    <section class="max-w-3xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg font-sans">
      <h1 class="text-3xl font-bold text-center mb-3 text-indigo-400">Password Generator</h1>
      <div class="border-b border-b-gray-400/50 h-1 mb-6"></div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div class="flex items-center">
          <label for="length" class="mr-2 font-medium">Length :</label>
          <button (click)="passwordService.decrementLength()"
                  class="px-3 py-1 bg-gray-700 rounded-l-md hover:bg-gray-600 transition-colors">-
          </button>
          <input type="number" id="length" [value]="passwordService.length()"
                 (input)="passwordService.length.set(+$any($event.target).value)"
                 class="w-16 text-center bg-gray-800 border-y border-gray-700 focus:outline-none no-spinners">
          <button (click)="passwordService.incrementLength()"
                  class="px-3 py-1 bg-gray-700 rounded-r-md hover:bg-gray-600 transition-colors">+
          </button>
        </div>
        <div class="flex items-center">
          <label for="count" class="mr-2 font-medium">Count :</label>
          <button (click)="passwordService.decrementCount()"
                  class="px-3 py-1 bg-gray-700 rounded-l-md hover:bg-gray-600 transition-colors">-
          </button>
          <input type="number" id="count" [value]="passwordService.count()"
                 (input)="passwordService.count.set(+$any($event.target).value)" max="20"
                 class="w-16 text-center bg-gray-800 border-y border-gray-700 focus:outline-none no-spinners">
          <button (click)="passwordService.incrementCount()"
                  class="px-3 py-1 bg-gray-700 rounded-r-md hover:bg-gray-600 transition-colors">+
          </button>
        </div>
      </div>

      <!-- Character Set Options -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <label class="flex items-center cursor-pointer">
          <input type="checkbox" [checked]="passwordService.uppercase()"
                 (change)="passwordService.uppercase.set($any($event.target).checked)"
                 class="form-checkbox h-5 w-5 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500">
          <span class="ml-2">Uppercase (A-Z)</span>
        </label>
        <label class="flex items-center cursor-pointer">
          <input type="checkbox" [checked]="passwordService.lowercase()"
                 (change)="passwordService.lowercase.set($any($event.target).checked)"
                 class="form-checkbox h-5 w-5 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500">
          <span class="ml-2">Lowercase (a-z)</span>
        </label>
        <label class="flex items-center cursor-pointer">
          <input type="checkbox" [checked]="passwordService.numbers()"
                 (change)="passwordService.numbers.set($any($event.target).checked)"
                 class="form-checkbox h-5 w-5 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500">
          <span class="ml-2">Numbers (0-9)</span>
        </label>
        <label class="flex items-center cursor-pointer">
          <input type="checkbox" [checked]="passwordService.symbolsEnabled()"
                 (change)="passwordService.symbolsEnabled.set($any($event.target).checked)"
                 class="form-checkbox h-5 w-5 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500">
          <span class="ml-2">Symbols</span>
        </label>
      </div>

      <!-- Symbols Input -->
      @if (passwordService.symbolsEnabled()) {
        <div class="mb-4">
          <label for="symbols" class="block mb-1 font-medium">Symbols to include :</label>
          <div class="flex items-center justify-between gap-4">
            <input type="text" id="symbols" [value]="passwordService.symbols()"
                   (input)="passwordService.symbols.set($any($event.target).value)"
                   class="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <i class="material-icons cursor-pointer hover:opacity-90 p-1 bg-gray-400 rounded-full"
               (click)="passwordService.restoreDefaultSymbols()">refresh</i>
          </div>
        </div>
      }

      <!-- Omit Characters Options -->
      <div class="mb-4">
        <label for="omit" class="block mb-1 font-medium">Characters to omit :</label>
        <input type="text" [value]="passwordService.omit()"
               (input)="passwordService.omit.set($any($event.target).value)"
               class="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
      </div>

      <div class="mb-4">
        <label class="flex items-center cursor-pointer">
          <input type="checkbox" [checked]="passwordService.uniqueChars()"
                 (change)="passwordService.uniqueChars.set($any($event.target).checked)"
                 class="form-checkbox h-5 w-5 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500">
          <span class="ml-2">Unique characters</span>
        </label>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <app-button
          [label]="'Generate Passwords'"
          [disabled]="!passwordService.isGenerationPossible()"
          (btnClicked)="passwordService.generatePasswords()"
          color="bg-green-600 hover:bg-green-700"
        ></app-button>
        <app-button
          [label]="'Reset Settings'"
          (btnClicked)="passwordService.resetSettings()"
          color="bg-gray-600 hover:bg-gray-700"
        ></app-button>
      </div>

      <div class="border-b border-b-gray-400/50 h-1 mt-5"></div>

      <!-- Generated Passwords Display -->
      <div class="mt-6">
        @for (p of passwordService.passwords(); track p.value; let i = $index) {
          <div class="mb-4">
            <div class="relative flex items-center">
              <input
                type="text"
                [value]="p.value"
                readonly
                [class]="'w-full p-3 bg-gray-800 border rounded-l-md focus:outline-none focus:ring-2 ' + getStrengthClass(p.strength)"
                placeholder="P4$w0rd"
              />
              <button
                (click)="copyToClipboard(p.value)"
                class="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-r-md transition-colors w-24 flex items-center justify-center"
              >
                @if (copiedPassword() === p.value) {
                  <i class="material-icons text-white">check</i>
                } @else {
                  <i class="material-icons-outlined">copy</i>
                }
              </button>
            </div>
            <p [class]="'text-sm text-center mt-1 ' + getStrengthClass(p.strength)">
              Strength : {{ p.strength }} ({{ p.bits | number:'1.0-0' }} bits)
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class PasswordGenerator {
  copiedPassword = signal<string | null>(null);

  passwordService = inject(PasswordGeneratorService);

  getStrengthClass(strength: string): string {
    switch (strength) {
      case 'Weak':
        return 'border-red-500 text-red-500';
      case 'Medium':
        return 'border-yellow-500 text-yellow-500';
      case 'Strong':
        return 'border-green-500 text-green-500';
      case 'Very Strong':
        return 'border-blue-500 text-blue-500';
      case 'Ultra Strong':
        return 'border-purple-500 text-purple-500';
      default:
        return 'border-gray-700';
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedPassword.set(text);
      setTimeout(() => {
        if (this.copiedPassword() === text) {
          this.copiedPassword.set(null);
        }
      }, 2000);
    })
  }
}
