import { Component, inject, output } from '@angular/core';
import { FileItemComponent } from './file-item.component';
import { FileSystemService } from '../../../core/services/file-system.service';
import { FileNode } from '../../../core/models/file-node.model';

@Component({
  selector: 'app-file-tree',
  standalone: true,
  imports: [FileItemComponent],
  template: `
    <div class="h-full flex flex-col bg-gray-950 border-r border-gray-800">
      <div class="p-4 border-b border-gray-800 flex justify-between items-center">
        <span class="font-bold text-gray-400 text-sm uppercase tracking-wider">Explorer</span>
        <button 
          (click)="openDirectory()" 
          class="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
          title="Open Folder">
          <span class="material-icons text-sm">create_new_folder</span>
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-2">
        @if (fileTree().length === 0) {
          <div class="text-center mt-10 text-gray-600 text-sm">
            <p>No folder opened</p>
            <button (click)="openDirectory()" class="text-indigo-400 hover:underline mt-2">Open...</button>
          </div>
        }
        
        @for (node of fileTree(); track node.name) {
          <app-file-item 
            [node]="node" 
            (fileSelected)="onFileSelected($event)" 
          />
        }
      </div>
    </div>
  `
})
export class FileTreeComponent {
  private fileSystemService = inject(FileSystemService);
  fileTree = this.fileSystemService.fileTree;
  fileSelected = output<FileNode>();

  openDirectory(): void {
    this.fileSystemService.openDirectory();
  }

  onFileSelected(node: FileNode): void {
    this.fileSelected.emit(node);
  }
}
