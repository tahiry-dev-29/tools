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

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    this.ffmpeg.on('progress', ({ progress }) => {
      this.progress.set(Math.round(progress * 100));
    });

    this.loaded.set(true);
  }

  async convertMp4ToWebm(file: File): Promise<Blob> {
    await this.load();
    const inputName = 'input.mp4';
    const outputName = 'output.webm';

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));
    await this.ffmpeg.exec(['-i', inputName, '-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0', outputName]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data as any], { type: 'video/webm' });
  }

  async convertWebmToMp4(file: File): Promise<Blob> {
    await this.load();
    const inputName = 'input.webm';
    const outputName = 'output.mp4';

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));
    await this.ffmpeg.exec(['-i', inputName, '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', outputName]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data as any], { type: 'video/mp4' });
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
