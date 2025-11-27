import { Injectable, signal } from '@angular/core';
import JSZip from 'jszip';

export interface BatchJob {
  id: string;
  file: File;
  targetFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: Blob;
  error?: string;
  progress: number;
}

@Injectable({
  providedIn: 'root'
})
export class BatchProcessorService {
  
  jobs = signal<BatchJob[]>([]);
  isProcessing = signal(false);

  /**
   * Add files to batch queue
   */
  addToBatch(files: File[], targetFormat: string): void {
    const newJobs: BatchJob[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      targetFormat,
      status: 'pending',
      progress: 0
    }));

    this.jobs.update(current => [...current, ...newJobs]);
  }

  /**
   * Process all pending jobs
   */
  async processBatch(
    converter: (file: File, format: string) => Promise<Blob>
  ): Promise<void> {
    this.isProcessing.set(true);

    const pendingJobs = this.jobs().filter(job => job.status === 'pending');

    for (const job of pendingJobs) {
      try {
        this.updateJobStatus(job.id, 'processing', 50);
        
        const result = await converter(job.file, job.targetFormat);
        
        this.updateJobStatus(job.id, 'completed', 100, result);
      } catch (error) {
        this.updateJobStatus(
          job.id,
          'error',
          0,
          undefined,
          error instanceof Error ? error.message : 'Conversion failed'
        );
      }
    }

    this.isProcessing.set(false);
  }

  /**
   * Download all completed jobs as ZIP
   */
  async downloadAsZip(filename: string = 'converted-files.zip'): Promise<void> {
    const completedJobs = this.jobs().filter(job => job.status === 'completed' && job.result);

    if (completedJobs.length === 0) {
      throw new Error('No completed jobs to download');
    }

    const zip = new JSZip();

    // Add each file to ZIP
    for (const job of completedJobs) {
      if (job.result) {
        const extension = job.targetFormat;
        const baseName = job.file.name.substring(0, job.file.name.lastIndexOf('.')) || job.file.name;
        const fileName = `${baseName}.${extension}`;
        
        zip.file(fileName, job.result);
      }
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all jobs
   */
  clearJobs(): void {
    this.jobs.set([]);
  }

  /**
   * Remove specific job
   */
  removeJob(id: string): void {
    this.jobs.update(current => current.filter(job => job.id !== id));
  }

  /**
   * Update job status
   */
  private updateJobStatus(
    id: string,
    status: BatchJob['status'],
    progress: number,
    result?: Blob,
    error?: string
  ): void {
    this.jobs.update(current =>
      current.map(job =>
        job.id === id
          ? { ...job, status, progress, result, error }
          : job
      )
    );
  }

  /**
   * Get job statistics
   */
  getStats() {
    const allJobs = this.jobs();
    return {
      total: allJobs.length,
      pending: allJobs.filter(j => j.status === 'pending').length,
      processing: allJobs.filter(j => j.status === 'processing').length,
      completed: allJobs.filter(j => j.status === 'completed').length,
      error: allJobs.filter(j => j.status === 'error').length
    };
  }
}
