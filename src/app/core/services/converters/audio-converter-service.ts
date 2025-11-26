import { Injectable } from '@angular/core';
import { VideoConverterService } from './video-converter-service';

@Injectable({
  providedIn: 'root'
})
export class AudioConverterService {
  constructor(private videoConverter: VideoConverterService) {}

  async convertMp3ToWav(file: File): Promise<Blob> {
    return this.videoConverter.extractAudio(file, 'wav');
  }

  async convertWavToMp3(file: File): Promise<Blob> {
    return this.videoConverter.extractAudio(file, 'mp3');
  }
}
