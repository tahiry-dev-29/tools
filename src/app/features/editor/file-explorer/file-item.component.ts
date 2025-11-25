import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileNode } from '../../../core/models/file-node.model';

@Component({
  selector: 'app-file-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cursor-pointer select-none">
      <div 
        (click)="handleClick($event)"
        class="flex items-center py-1 px-2 hover:bg-gray-800 rounded text-gray-300 hover:text-white transition-colors">
        <span class="material-icons text-sm mr-2 text-gray-500">
          {{ node().kind === 'directory' ? 'folder' : 'description' }}
        </span>
        <span class="truncate">{{ node().name }}</span>
      </div>
      
      @if (node().kind === 'directory' && expanded()) {
        <div class="ml-4 border-l border-gray-800 pl-1">
          @for (child of node().children; track child.name) {
            <app-file-item 
              [node]="child" 
              (fileSelected)="fileSelected.emit($event)" 
            />
          }
        </div>
      }
    </div>
  `
})
export class FileItemComponent {
  node = input.required<FileNode>();
  fileSelected = output<FileNode>();
  
  expanded = signal(false);

  handleClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.node().kind === 'directory') {
      this.expanded.update(value => !value);
    } else {
      this.fileSelected.emit(this.node());
    }
  }
}
