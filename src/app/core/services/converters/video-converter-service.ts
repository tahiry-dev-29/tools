import { Injectable, signal } from '@angular/core';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

@Injectable({
  providedIn: 'root'
})
export class VideoConverterService {
  private ffmpeg: FFmpeg;
  private loaded = signal(false);
  private progress = signal(0);

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  isLoaded() {
    return this.loaded();
  }

  getProgress() {
    return this.progress();
  }

  async load() {
    if (this.loaded()) return;

    console.log('Loading FFmpeg...');
    const baseURL = 'assets/ffmpeg';

    this.ffmpeg.on('progress', ({ progress }) => {
      this.progress.set(Math.round(progress * 100));
    });

    this.ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg Log:', message);
    });

    try {
      const loadPromise = this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      await loadPromise;

      this.loaded.set(true);
      console.log('FFmpeg loaded successfully');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      this.loaded.set(false);
      throw error;
    }
  }

  async convertVideo(file: File, outputFormat: string): Promise<Blob> {
    await this.load();
    const inputExt = file.name.split('.').pop() || 'video';
    const inputName = `input.${inputExt}`;
    const outputName = `output.${outputFormat}`;

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    const args = ['-i', inputName];

    if (outputFormat === 'mp4') {
      args.push('-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23');
    } else if (outputFormat === 'webm') {
      args.push('-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '8', '-crf', '30', '-b:v', '0');
    }

    args.push(outputName);

    await this.ffmpeg.exec(args);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data as any], { type: `video/${outputFormat}` });
  }

  async convertMp4ToWebm(file: File): Promise<Blob> {
    return this.convertVideo(file, 'webm');
  }

  async convertWebmToMp4(file: File): Promise<Blob> {
    return this.convertVideo(file, 'mp4');
  }

  async convertToGif(file: File, fps: number = 10, scale: number = 320): Promise<Blob> {
    await this.load();
    const inputName = `input.${file.name.split('.').pop()}`;
    const outputName = 'output.gif';

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));
    await this.ffmpeg.exec([
      '-i', inputName, 
      '-vf', `fps=${fps},scale=${scale}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, 
      outputName
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data as any], { type: 'image/gif' });
  }

  async extractAudio(file: File, format: 'mp3' | 'wav' = 'mp3'): Promise<Blob> {
    await this.load();
    const inputName = `input.${file.name.split('.').pop()}`;
    const outputName = `output.${format}`;

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    if (format === 'mp3') {
      await this.ffmpeg.exec([
        '-i', inputName, 
        '-vn', 
        '-acodec', 'libmp3lame', 
        '-b:a', '128k',
        outputName
      ]);
      return new Blob([await this.ffmpeg.readFile(outputName) as any], { type: 'audio/mpeg' });
    } else {
      await this.ffmpeg.exec(['-i', inputName, '-vn', '-acodec', 'pcm_s16le', outputName]);
      return new Blob([await this.ffmpeg.readFile(outputName) as any], { type: 'audio/wav' });
    }
  }
}
