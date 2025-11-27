import { Injectable, signal } from '@angular/core';
import { FileNode } from '../models/file-node.model';

@Injectable({
  providedIn: 'root',
})
export class FileSystemService {
  // English comment: Signal to hold the directory handle.
  directoryHandle = signal<FileSystemDirectoryHandle | null>(null);
  // English comment: Signal to hold the file and folder structure.
  fileTree = signal<FileNode[]>([]);

  constructor() {}

  /**
   * Opens a directory and populates the file tree.
   */
  async openDirectory(): Promise<void> {
    try {
      const handle = await window.showDirectoryPicker();
      this.directoryHandle.set(handle);
      const tree = await this.buildFileTree(handle);
      this.fileTree.set(tree);
    } catch (error) {
      console.error('Error opening directory:', error);
    }
  }

  /**
   * Recursively builds the file tree from a directory handle.
   * @param dirHandle The directory handle to process.
   * @returns A promise that resolves to an array of FileNode.
   */
  private async buildFileTree(dirHandle: FileSystemDirectoryHandle): Promise<FileNode[]> {
    const tree: FileNode[] = [];
    for await (const entry of dirHandle.values()) {
      const node: FileNode = {
        name: entry.name,
        kind: entry.kind,
        handle: entry,
      };
      if (entry.kind === 'directory') {
        node.children = await this.buildFileTree(entry as FileSystemDirectoryHandle);
      }
      tree.push(node);
    }
    return tree;
  }

  /**
   * Reads the content of a file.
   * @param fileHandle The file handle to read.
   * @returns A promise that resolves to the file content as a string.
   */
  async readFile(fileHandle: FileSystemFileHandle): Promise<string> {
    const file = await fileHandle.getFile();
    return await file.text();
  }

  /**
   * Writes content to a file.
   * @param fileHandle The file handle to write to.
   * @param content The content to write.
   */
  async writeFile(fileHandle: FileSystemFileHandle, content: string): Promise<void> {
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }
}
