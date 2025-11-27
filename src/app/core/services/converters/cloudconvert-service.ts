import { Injectable, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CloudConvertService {
  private apiKey = signal(environment.cloudConvert.apiKey);
  private baseUrl = environment.cloudConvert.baseUrl;

  // Resource to track user quota
  // Note: This requires the API key to be set. 
  // We use a computed signal for the headers to react to API key changes.
  userResource = httpResource(() => {
    const key = this.apiKey();
    if (!key) return undefined;
    return {
      url: `${this.baseUrl}/users/me`,
      headers: {
        'Authorization': `Bearer ${key}`
      }
    };
  });

  // Computed signals for UI
  quotaRemaining = computed(() => {
    const data = this.userResource.value() as any;
    if (!data) return null;
    return data.data.credits;
  });

  isConfigured = computed(() => !!this.apiKey());

  setApiKey(key: string) {
    this.apiKey.set(key);
  }

  /**
   * Convert file using CloudConvert API
   * Flow: Create Job -> Upload File -> Wait for Completion -> Download
   */
  async convert(file: File, targetFormat: string): Promise<Blob> {
    if (!this.apiKey()) {
      throw new Error('CloudConvert API key not configured');
    }

    // 1. Create Job
    const jobData = {
      tasks: {
        'import-1': {
          operation: 'import/upload'
        },
        'task-1': {
          operation: 'convert',
          input_format: file.name.split('.').pop(),
          output_format: targetFormat,
          engine: 'office',
          input: ['import-1']
        },
        'export-1': {
          operation: 'export/url',
          input: ['task-1']
        }
      },
      tag: 'jobbuilder'
    };

    const jobResponse = await this.post('/jobs', jobData);
    const uploadTask = jobResponse.data.tasks.find((t: any) => t.name === 'import-1');
    const exportTask = jobResponse.data.tasks.find((t: any) => t.name === 'export-1');
    const jobId = jobResponse.data.id;

    // 2. Upload File
    const uploadUrl = uploadTask.result.form.url;
    const uploadParams = uploadTask.result.form.parameters;
    
    const formData = new FormData();
    for (const key in uploadParams) {
      formData.append(key, uploadParams[key]);
    }
    formData.append('file', file);

    await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    // 3. Wait for Job Completion
    let status = 'processing';
    let resultUrl = '';

    while (status !== 'finished' && status !== 'error') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const jobStatus = await this.get(`/jobs/${jobId}`);
      status = jobStatus.data.status;
      
      if (status === 'finished') {
        const exportTaskResult = jobStatus.data.tasks.find((t: any) => t.name === 'export-1');
        resultUrl = exportTaskResult.result.files[0].url;
      } else if (status === 'error') {
        throw new Error('CloudConvert job failed');
      }
    }

    // 4. Download Result
    const response = await fetch(resultUrl);
    return await response.blob();
  }

  private async post(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  }

  private async get(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey()}`
      }
    });
    return await response.json();
  }
}
