import { Component, signal, output } from '@angular/core';
import { FileTypeIcon, FileTypeIconComponent } from '../../../../shared/file-type-icon';


@Component({
  selector: 'app-file-input-dropzone',
  standalone: true,
  imports: [FileTypeIconComponent],
  template: `
    <div
      class="dropzone"
      [class.dragging]="isDragging()"
      [class.error]="error()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
      (click)="fileInput.click()"
    >
      <input
        #fileInput
        type="file"
        hidden
        (change)="onFileSelected($event)"
        accept="image/*,video/*,.pdf,.docx,.txt,.md"
      />
      
      @if (selectedFile()) {
        <div class="file-info">
          <span class="icon">📄</span>
          <div class="details">
            <p class="name">{{ selectedFile()?.name }}</p>
            <p class="size">{{ formatSize(selectedFile()?.size ?? 0) }}</p>
          </div>
          <button class="remove-btn" (click)="clearFile($event)">✕</button>
        </div>
      } @else {
        <div class="placeholder">
          <span class="icon">☁️</span>
          <p>Drag & Drop your file here</p>
          <p class="sub-text">or click to browse</p>
          <div class="supported-types">
            <p>Supports:</p>
            <div class="type-icons">
              @for (type of supportedTypes; track type.id) {
                <div class="type-icon" [title]="type.label">
                  <app-file-type-icon [type]="type.icon" />
                  <span>{{ type.label }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }

      @if (error()) {
        <div class="error-message">
          {{ error() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .dropzone {
      border: 2px dashed var(--border-color, #ccc);
      border-radius: 12px;
      padding: 3rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .dropzone:hover, .dropzone.dragging {
      border-color: var(--primary-color, #3b82f6);
      background: rgba(59, 130, 246, 0.1);
      transform: scale(1.01);
    }
    
    .dropzone.error {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary, #666);
    }

    .placeholder .icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }

    .placeholder p {
      margin: 0;
      font-weight: 500;
      color: var(--text-primary, #333);
    }

    .placeholder .sub-text {
      font-size: 0.9rem;
      font-weight: 400;
      color: var(--text-secondary, #666);
    }

    .placeholder .supported-types {
      margin-top: 1.5rem;
      width: 100%;
    }

    .placeholder .supported-types > p {
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
      opacity: 0.8;
    }

    .type-icons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
    }

    .type-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background 0.2s ease;
    }

    .type-icon:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .type-icon span {
      font-size: 0.7rem;
      color: var(--text-secondary, #888);
      font-weight: 500;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      width: 100%;
      max-width: 400px;
    }

    .file-info .icon {
      font-size: 2rem;
    }

    .file-info .details {
      flex: 1;
      text-align: left;
    }

    .file-info .name {
      margin: 0;
      font-weight: 600;
      font-size: 0.95rem;
      word-break: break-all;
    }

    .file-info .size {
      margin: 0;
      font-size: 0.8rem;
      color: #666;
    }

    .remove-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #999;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background 0.2s;
    }

    .remove-btn:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #ef4444;
    }

    .error-message {
      margin-top: 1rem;
      color: #ef4444;
      font-size: 0.9rem;
      background: rgba(239, 68, 68, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 4px;
    }
  `]
})
export class FileInputDropzoneComponent {
  fileSelected = output<File | null>();
  
  isDragging = signal(false);
  selectedFile = signal<File | null>(null);
  error = signal<string | null>(null);

  supportedTypes = [
    { id: 'image', icon: 'image' as FileTypeIcon, label: 'Images' },
    { id: 'video', icon: 'video' as FileTypeIcon, label: 'Video' },
    { id: 'pdf', icon: 'pdf' as FileTypeIcon, label: 'PDF' },
    { id: 'docx', icon: 'docx' as FileTypeIcon, label: 'DOCX' },
    { id: 'txt', icon: 'txt' as FileTypeIcon, label: 'TXT' },
    { id: 'markdown', icon: 'markdown' as FileTypeIcon, label: 'Markdown' }
  ];

  private readonly ALLOWED_TYPES = [
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/plain',
    'text/markdown' // .md files
  ];

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    this.error.set(null);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    if (!this.isValidFileType(file)) {
      this.error.set('Unsupported file type. Please upload an Image, Video, PDF, DOCX, or TXT file.');
      this.selectedFile.set(null);
      this.fileSelected.emit(null);
      return;
    }

    this.selectedFile.set(file);
    this.fileSelected.emit(file);
  }

  isValidFileType(file: File): boolean {
    // Check MIME type
    if (this.ALLOWED_TYPES.includes(file.type)) {
      return true;
    }
    // Fallback check for extensions if MIME type is empty or generic
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm', 'pdf', 'docx', 'txt', 'md'];
    return extension ? allowedExtensions.includes(extension) : false;
  }

  clearFile(event: Event) {
    event.stopPropagation();
    this.selectedFile.set(null);
    this.error.set(null);
    this.fileSelected.emit(null);
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
