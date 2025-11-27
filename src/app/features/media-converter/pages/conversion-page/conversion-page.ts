import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileInputDropzoneComponent } from '../../components/file-input-dropzone/file-input-dropzone';
import { FileConverterService } from '../../../../core/services/file-converter-service';
import { VideoConverterService } from '../../../../core/services/converters/video-converter-service';
import { CloudConvertService } from '../../../../core/services/converters/cloudconvert-service';
import { FormsModule } from '@angular/forms';
import { getAvailableFormats, getDefaultTargetFormat, detectFileType } from '../../../../core/config/conversion-config';
import { ApiSettingsComponent } from '../../components/api-settings/api-settings';
import { FilePreviewComponent } from '../../components/file-preview/file-preview';
import { ConversionStatusComponent } from '../../components/conversion-status/conversion-status';

@Component({
  selector: 'app-conversion-page',
  standalone: true,
  imports: [
    CommonModule, 
    FileInputDropzoneComponent, 
    FormsModule,
    ApiSettingsComponent,
    FilePreviewComponent,
    ConversionStatusComponent
  ],
  template: `
    <div class="h-full flex flex-col p-6 overflow-auto">

      <div class="max-w-4xl mx-auto w-full grid gap-8">
        <!-- Upload Section -->
        <section class="card bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <app-file-input-dropzone (fileSelected)="onFileSelected($event)"></app-file-input-dropzone>
        </section>

        <!-- Conversion Settings & Preview -->
        @if (selectedFile()) {
          <div class="conversion-panel bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <div class="file-summary mb-6">
              <app-api-settings></app-api-settings>

              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-medium">{{ selectedFile()?.name }}</h3>
                  <p class="text-sm text-gray-400">{{ formatSize(selectedFile()?.size ?? 0) }}</p>
                </div>
              </div>

              <app-file-preview [file]="selectedFile()!"></app-file-preview>
            </div>

            <div class="controls grid gap-6">
              <div class="format-selector">
                <label class="block text-sm font-medium text-gray-400 mb-2">Format de sortie</label>
                <div class="flex gap-2 flex-wrap">
                  @for (format of availableFormats(); track format) {
                    <button 
                      class="px-4 py-2 rounded-lg border transition-all duration-200"
                      [class.bg-blue-600]="targetFormat() === format"
                      [class.border-blue-500]="targetFormat() === format"
                      [class.text-white]="targetFormat() === format"
                      [class.bg-gray-700]="targetFormat() !== format"
                      [class.border-gray-600]="targetFormat() !== format"
                      [class.text-gray-300]="targetFormat() !== format"
                      [class.hover:bg-gray-600]="targetFormat() !== format"
                      (click)="setTargetFormat(format)"
                    >
                      {{ format.toUpperCase() }}
                    </button>
                  }
                </div>
              </div>

              <button 
                class="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-lg transition-all transform active:scale-[0.99]"
                [disabled]="!targetFormat() || isConverting()"
                (click)="convert()"
              >
                @if (isConverting()) {
                  <span class="flex items-center justify-center gap-2">
                    <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Conversion...
                  </span>
                } @else {
                  Convertir maintenant
                }
              </button>
            </div>

            <app-conversion-status
              [warning]="conversionWarning()"
              [isConverting]="isConverting()"
              [progress]="videoProgress()"
              [convertedFileUrl]="convertedFileUrl()"
              [downloadName]="getDownloadName()"
            ></app-conversion-status>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class ConversionPage {
  selectedFile = signal<File | null>(null);
  targetFormat = signal<string>('');
  isConverting = signal(false);
  convertedFileUrl = signal<string | null>(null);
  
  private fileConverter = inject(FileConverterService);
  private videoConverter = inject(VideoConverterService);
  private cloudConvert = inject(CloudConvertService);
  
  // Signals
  videoProgress = computed(() => this.videoConverter.getProgress());
  apiConfigured = this.cloudConvert.isConfigured;
  
  availableFormats = computed(() => {
    const file = this.selectedFile();
    return file ? getAvailableFormats(file) : [];
  });

  conversionWarning = computed(() => {
    const source = this.selectedFile();
    const target = this.targetFormat();
    if (!source || !target) return null;
    
    const sourceType = detectFileType(source);
    if (!sourceType) return null;
    
    const key = `${sourceType}->${target}`;
    
    if (key === 'pdf->docx') {
      if (this.apiConfigured()) {
        return '✨ Conversion haute fidélité via CloudConvert API';
      } else {
        return '⚠️ API non configurée : La mise en forme sera perdue (texte brut uniquement)';
      }
    }

    const warnings: Record<string, string> = {
      'pdf->txt': '⚠️ La mise en forme sera perdue (texte brut uniquement)',
      'pdf->html': '⚠️ La mise en forme sera perdue (texte brut uniquement)',
      'pdf->md': '⚠️ La mise en forme sera perdue (texte brut uniquement)',
      'docx->txt': '⚠️ La mise en forme sera perdue (texte brut uniquement)',
      'txt->pdf': 'ℹ️ Création de PDF basique (texte brut)',
      'txt->docx': 'ℹ️ Création de DOCX basique (texte brut)',
      'video->gif': 'ℹ️ La conversion en GIF peut prendre du temps',
      'video->mp4': 'ℹ️ Encodage H.264 en cours...',
      'video->webm': 'ℹ️ Encodage VP9 en cours...'
    };
    
    return warnings[key] || null;
  });

  onFileSelected(file: File | null) {
    if (!file) {
      this.selectedFile.set(null);
      return;
    }
    this.selectedFile.set(file);
    this.convertedFileUrl.set(null);
    
    // Auto-select default format
    const defaultFormat = getDefaultTargetFormat(file);
    if (defaultFormat) {
      this.targetFormat.set(defaultFormat);
    }

    // Load FFmpeg if needed
    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      this.videoConverter.load();
    }
  }

  setTargetFormat(format: string) {
    this.targetFormat.set(format);
  }

  async convert() {
    const file = this.selectedFile();
    if (!file) return;

    this.isConverting.set(true);
    this.convertedFileUrl.set(null);

    try {
      // Use strategy service (which handles hybrid logic)
      const result = await this.fileConverter.convert(file, this.targetFormat() as any);
      
      const blob = result instanceof Blob ? result : new Blob([result]);
      const url = URL.createObjectURL(blob);
      this.convertedFileUrl.set(url);
    } catch (error) {
      console.error('Conversion failed', error);
      alert('La conversion a échoué. Vérifiez la console pour plus de détails.');
    } finally {
      this.isConverting.set(false);
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getDownloadName(): string {
    const file = this.selectedFile();
    if (!file) return 'converted-file';
    const name = file.name.substring(0, file.name.lastIndexOf('.'));
    return `${name}.${this.targetFormat()}`;
  }
}
