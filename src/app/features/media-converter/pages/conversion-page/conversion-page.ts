import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileInputDropzoneComponent } from '../../components/file-input-dropzone/file-input-dropzone';
import { FileConverterService } from '../../../../core/services/file-converter.service';
import { FormsModule } from '@angular/forms';
import { getAvailableFormats, getDefaultTargetFormat, getMimeType, detectFileType } from '../../../../core/config/conversion-config';

@Component({
  selector: 'app-conversion-page',
  standalone: true,
  imports: [CommonModule, FileInputDropzoneComponent, FormsModule],
  template: `
    <div class="container">
      <header>
        <h1>Local Media Converter</h1>
        <p>Convert your files 100% offline, right in your browser.</p>
      </header>

      <main>
        <app-file-input-dropzone (fileSelected)="onFileSelected($event)" />
        
        @if (selectedFile()) {
          <div class="conversion-panel">
            <div class="file-summary">
              <h3>Selected: {{ selectedFile()?.name }}</h3>
              <p class="size">{{ formatSize(selectedFile()?.size ?? 0) }}</p>
            </div>

            <div class="options">
              <div class="option-group">
                <label for="format">Output Format</label>
                <select id="format" [ngModel]="targetFormat()" (ngModelChange)="targetFormat.set($event)">
                  @for (format of availableFormats(); track format) {
                    <option [value]="format">{{ format.toUpperCase() }}</option>
                  }
                </select>
              </div>

              @if (isImageFile()) {
                <div class="option-group">
                  <label for="quality">Quality ({{ quality() * 100 }}%)</label>
                  <input 
                    type="range" 
                    id="quality" 
                    min="0.1" 
                    max="1" 
                    step="0.1" 
                    [ngModel]="quality()" 
                    (ngModelChange)="quality.set($event)"
                  >
                </div>
              }
            </div>

            <!-- Warning Banner -->
            @if (conversionWarning()) {
              <div class="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3 text-yellow-200">
                <span>{{ conversionWarning() }}</span>
              </div>
            }

            <button 
              class="convert-btn" 
              [disabled]="isConverting()" 
              (click)="convert()"
            >
              @if (isConverting()) {
                Converting...
              } @else {
                Convert Now
              }
            </button>

            @if (error()) {
              <div class="error">{{ error() }}</div>
            }
          </div>
        }

        @if (convertedFileUrl()) {
          <div class="result-panel">
            <h3>Conversion Complete! 🎉</h3>
            <a [href]="convertedFileUrl()" [download]="getDownloadName()" class="download-btn">
              Download {{ getDownloadName() }}
            </a>
            <button class="reset-btn" (click)="reset()">Convert Another</button>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
      font-family: 'Inter', sans-serif;
    }

    header {
      margin-bottom: 3rem;
    }

    header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #60a5fa, #a855f7);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
    }

    header p {
      color: #9ca3af;
      font-size: 1.1rem;
    }

    main {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .conversion-panel, .result-panel {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      padding: 2rem;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      animation: fadeIn 0.5s ease-out;
    }

    .file-summary {
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .file-summary h3 { margin: 0; font-size: 1.1rem; }
    .file-summary .size { color: #888; font-size: 0.9rem; margin: 0; }

    .options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
      text-align: left;
    }

    .option-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-size: 0.9rem;
      color: #ccc;
      font-weight: 500;
    }

    select, input[type="range"] {
      width: 100%;
      padding: 0.8rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.2);
      color: white;
      font-size: 1rem;
    }

    .convert-btn, .download-btn {
      width: 100%;
      padding: 1rem;
      border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .convert-btn:hover:not(:disabled), .download-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .convert-btn:disabled {
      opacity: 0.7;
      cursor: wait;
    }

    .download-btn {
      display: inline-block;
      text-decoration: none;
      margin-bottom: 1rem;
    }

    .reset-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ccc;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .error {
      color: #ef4444;
      margin-top: 1rem;
      padding: 0.5rem;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 4px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ConversionPage {
  private converter = inject(FileConverterService);

  selectedFile = signal<File | null>(null);
  targetFormat = signal<string>('webp');
  quality = signal(0.9);
  
  isConverting = signal(false);
  convertedFileUrl = signal<string | null>(null);
  error = signal<string | null>(null);

  isImageFile = computed(() => {
    const file = this.selectedFile();
    return file?.type.startsWith('image/') ?? false;
  });

  isTextFile = computed(() => {
    const file = this.selectedFile();
    return file?.type === 'text/plain' || file?.name.endsWith('.txt');
  });

  availableFormats = computed(() => {
    const file = this.selectedFile();
    if (!file) return [];

    return getAvailableFormats(file);
  });

  onFileSelected(file: File | null) {
    this.selectedFile.set(file);
    this.convertedFileUrl.set(null);
    this.error.set(null);
    
    if (!file) return;

    // Use config-based default format detection
    const defaultFormat = getDefaultTargetFormat(file);
    if (defaultFormat) {
      this.targetFormat.set(defaultFormat);
    }
  }

  conversionWarning = computed(() => {
    const source = this.selectedFile();
    const target = this.targetFormat();
    if (!source || !target) return null;
    
    const sourceType = detectFileType(source);
    if (!sourceType) return null;
    
    const key = `${sourceType}->${target}`;
    const warnings: Record<string, string> = {
      'pdf->txt': '⚠️ La mise en forme sera perdue (texte brut uniquement)',
      'docx->txt': '⚠️ La mise en forme sera perdue (texte brut uniquement)',
      'txt->pdf': 'ℹ️ Création de PDF basique (texte brut)',
      'txt->docx': 'ℹ️ Création de DOCX basique (texte brut)',
      'video->gif': 'ℹ️ La conversion en GIF peut prendre du temps',
      'video->mp4': 'ℹ️ Encodage H.264 en cours...',
      'video->webm': 'ℹ️ Encodage VP9 en cours...'
    };
    
    return warnings[key] || null;
  });

  async convert() {
    const file = this.selectedFile();
    if (!file) return;

    this.isConverting.set(true);
    this.error.set(null);

    try {
      const result = await this.converter.convert(
        file, 
        this.targetFormat(),
        { quality: this.quality() }
      );

      const blob = result instanceof Blob 
        ? result 
        : new Blob([result], { type: getMimeType(this.targetFormat() as any) });

      const url = URL.createObjectURL(blob);
      this.convertedFileUrl.set(url);
    } catch (err) {
      console.error('Conversion failed:', err);
      this.error.set(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      this.isConverting.set(false);
    }
  }

  reset() {
    this.selectedFile.set(null);
    this.convertedFileUrl.set(null);
    this.error.set(null);
  }

  getDownloadName(): string {
    const originalName = this.selectedFile()?.name ?? 'converted';
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    return `${nameWithoutExt}.${this.targetFormat()}`;
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
