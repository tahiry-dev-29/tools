import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conversion-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mt-4">
      <!-- Warning -->
      @if (warning()) {
        <div class="warning-banner mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-200 text-sm flex items-start gap-2">
          <span class="material-icons text-base mt-0.5">info</span>
          <span>{{ warning() }}</span>
        </div>
      }

      <!-- Progress -->
      @if (isConverting()) {
        <div class="progress-container mb-4">
          <div class="flex justify-between text-xs mb-1 text-gray-400">
            <span>Conversion en cours...</span>
            @if (progress()) { <span>{{ (progress()! * 100) | number:'1.0-0' }}%</span> }
          </div>
          <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="h-full bg-blue-500 transition-all duration-300"
              [style.width.%]="(progress() ?? 0) * 100"
            ></div>
          </div>
        </div>
      }

      <!-- Result -->
      @if (convertedFileUrl()) {
        <div class="result-panel p-4 bg-green-500/10 border border-green-500/20 rounded-lg animate-fade-in">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2 text-green-400">
              <span class="material-icons">check_circle</span>
              <span class="font-medium">Conversion terminée !</span>
            </div>
            <a 
              [href]="convertedFileUrl()" 
              [download]="downloadName()"
              class="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded shadow flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <span class="material-icons text-lg">download</span>
              Télécharger
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class ConversionStatusComponent {
  warning = input<string | null>(null);
  isConverting = input<boolean>(false);
  progress = input<number | null>(null);
  convertedFileUrl = input<string | null>(null);
  downloadName = input<string>('converted-file');
}
