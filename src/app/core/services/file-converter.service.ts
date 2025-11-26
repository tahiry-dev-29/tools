import { Injectable, inject } from '@angular/core';
import { ConversionStrategyService } from './conversion-strategy-service';
import { detectFileType, SupportedFormat } from '../config/conversion-config';

@Injectable({
  providedIn: 'root'
})
export class FileConverterService {
  private strategyService = inject(ConversionStrategyService);

  async convert(file: File, targetFormat: string, options?: any): Promise<Blob | string> {
    const sourceType = detectFileType(file);
    
    if (!sourceType) {
      throw new Error('Unknown file type');
    }

    const handler = this.strategyService.getHandler(sourceType, targetFormat as SupportedFormat);
    
    if (!handler) {
      throw new Error(`Conversion from ${sourceType} to ${targetFormat} not supported`);
    }

    return handler(file, options);
  }
}
