import { Injectable, inject } from '@angular/core';
import { FileType, SupportedFormat } from '../config/conversion-config';
import { DocumentConverterService } from './converters/document-converter-service';
import { VideoConverterService } from './converters/video-converter-service';
import { AudioConverterService } from './converters/audio-converter-service';
import { ImageProcessorService } from './processors/image-processor-service';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';
import { CloudConvertService } from './converters/cloudconvert-service';

/**
 * Conversion Strategy Interface
 */
interface ConversionStrategy {
  canConvert(source: FileType, target: SupportedFormat): boolean;
  convert(file: File, targetFormat: SupportedFormat, options?: any): Promise<Blob | string>;
}

/**
 * Strategy Registry - Maps conversion paths to handlers
 */
type ConversionHandler = (file: File, options?: any) => Promise<Blob | string>;
@Injectable({
  providedIn: 'root'
})
export class ConversionStrategyService {
  
  private strategies = new Map<string, ConversionHandler>();
  
  private documentConverter = inject(DocumentConverterService);
  private videoConverter = inject(VideoConverterService);
  private audioConverter = inject(AudioConverterService);
  private imageProcessor = inject(ImageProcessorService);
  private cloudConvert = inject(CloudConvertService);

  constructor() {
    this.registerStrategies();
  }

  /**
   * Register all conversion strategies
   * Using Map instead of if/else chains
   */
  private registerStrategies(): void {
    // === Document Conversions ===
    // PDF Source
    this.register('pdf', 'txt', (f) => this.documentConverter.pdfToText(f).then(t => new Blob([t], { type: 'text/plain' })));
    
    // PDF -> DOCX (Hybrid Strategy)
    this.register('pdf', 'docx', async (f) => {
      if (this.cloudConvert.isConfigured()) {
        try {
          return await this.cloudConvert.convert(f, 'docx');
        } catch (e) {
          console.warn('CloudConvert failed, falling back to text extraction', e);
        }
      }
      // Fallback: Text extraction
      const text = await this.documentConverter.pdfToText(f);
      const txtFile = new File([text], 'temp.txt');
      return this.txtToDocx(txtFile);
    });

    this.register('pdf', 'html', async (f) => {
      const text = await this.documentConverter.pdfToText(f);
      return new Blob([`<html><body><pre>${text}</pre></body></html>`], { type: 'text/html' });
    });
    this.register('pdf', 'md', async (f) => {
      const text = await this.documentConverter.pdfToText(f);
      return new Blob([text], { type: 'text/markdown' });
    });

    // DOCX Source
    this.register('docx', 'txt', (f) => this.documentConverter.docxToText(f).then(t => new Blob([t], { type: 'text/plain' })));
    this.register('docx', 'pdf', async (f) => {
      // Use HTML as intermediate format to preserve basic formatting
      const html = await this.documentConverter.docxToHtml(f);
      // Wrap in default style for better PDF look
      const styledHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          ${html}
        </div>
      `;
      return this.documentConverter.htmlToPdf(styledHtml);
    });
    this.register('docx', 'html', async (f) => {
      const html = await this.documentConverter.docxToHtml(f);
      return new Blob([html], { type: 'text/html' });
    });
    this.register('docx', 'md', async (f) => {
      // Convert to HTML first, then to Markdown to preserve structure
      const html = await this.documentConverter.docxToHtml(f);
      return this.documentConverter.htmlToMarkdown(html);
    });
    
    // Markdown Source
    this.register('markdown', 'html', async (f) => {
      const text = await f.text();
      return this.documentConverter.markdownToHtml(text);
    });
    this.register('markdown', 'pdf', (f) => f.text().then(t => this.documentConverter.markdownToPdf(t)));
    this.register('markdown', 'txt', (f) => f.text().then(t => new Blob([t], { type: 'text/plain' })));
    this.register('markdown', 'docx', async (f) => {
      const text = await f.text();
      const txtFile = new File([text], 'temp.txt');
      return this.txtToDocx(txtFile);
    });
    
    // HTML Source
    this.register('html', 'pdf', (f) => f.text().then(t => this.documentConverter.htmlToPdf(t)));
    this.register('html', 'md', (f) => f.text().then(t => this.documentConverter.htmlToMarkdown(t)));
    this.register('html', 'txt', (f) => f.text().then(t => new Blob([t.replace(/<[^>]*>/g, '')], { type: 'text/plain' })));
    this.register('html', 'docx', async (f) => {
      const text = await f.text();
      // Simple text extraction for now, could be improved
      const plainText = text.replace(/<[^>]*>/g, '');
      const txtFile = new File([plainText], 'temp.txt');
      return this.txtToDocx(txtFile);
    });

    // TXT Creations
    this.register('txt', 'pdf', this.txtToPdf.bind(this));
    this.register('txt', 'docx', this.txtToDocx.bind(this));
    this.register('txt', 'html', this.txtToHtml.bind(this));
    this.register('txt', 'md', this.txtToMarkdown.bind(this));

    // === Video Conversions ===
    this.register('video', 'mp4', (f) => this.videoConverter.convertVideo(f, 'mp4'));
    this.register('video', 'webm', (f) => this.videoConverter.convertVideo(f, 'webm'));
    this.register('video', 'gif', (f) => this.videoConverter.convertToGif(f));
    this.register('video', 'mp3', (f) => this.videoConverter.extractAudio(f, 'mp3'));
    this.register('video', 'wav', (f) => this.videoConverter.extractAudio(f, 'wav'));

    // === Audio Conversions ===
    this.register('audio', 'wav', (f) => this.audioConverter.convertMp3ToWav(f));
    this.register('audio', 'mp3', (f) => this.audioConverter.convertWavToMp3(f));

    // === Image Conversions ===
    this.register('image', 'png', (f) => this.convertImage(f, 'png'));
    this.register('image', 'jpeg', (f) => this.convertImage(f, 'jpeg'));
    this.register('image', 'webp', (f) => this.convertImage(f, 'webp'));
  }

  /**
   * Register a conversion strategy
   */
  private register(source: FileType, target: SupportedFormat, handler: ConversionHandler): void {
    const key = `${source}->${target}`;
    this.strategies.set(key, handler);
  }

  /**
   * Get conversion handler for source->target
   */
  getHandler(source: FileType, target: SupportedFormat): ConversionHandler | null {
    const key = `${source}->${target}`;
    
    // Generic handlers for video/audio/image if specific not found
    if (!this.strategies.has(key)) {
      if (source === 'video') {
        // For video, we might need to check extension, but for now map generic 'video'
        // Ideally we should have specific source types like 'mp4', 'webm' in the key
        // But our detection returns 'video'. 
        // Let's rely on the service to handle the file content.
        // However, the register above uses 'video' as source.
        return this.strategies.get(`video->${target}`) || null;
      }
    }
    
    return this.strategies.get(key) || null;
  }

  /**
   * Check if conversion is supported
   */
  canConvert(source: FileType, target: SupportedFormat): boolean {
    const key = `${source}->${target}`;
    return this.strategies.has(key);
  }

  // === Helper Implementations ===

  private async txtToPdf(file: File): Promise<Blob> {
    const text = await file.text();
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(text, 180);
    let y = 10;
    for (let i = 0; i < splitText.length; i++) {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      doc.text(splitText[i], 10, y);
      y += 7;
    }
    return doc.output('blob');
  }

  private async txtToDocx(file: File): Promise<Blob> {
    const text = await file.text();
    const doc = new Document({
      sections: [{
        properties: {},
        children: text.split('\n').map(line => new Paragraph({
          children: [new TextRun(line)],
        })),
      }],
    });
    return await Packer.toBlob(doc);
  }

  private async txtToHtml(file: File): Promise<Blob> {
    const text = await file.text();
    return new Blob([`<html><body><pre>${text}</pre></body></html>`], { type: 'text/html' });
  }

  private async txtToMarkdown(file: File): Promise<Blob> {
    const text = await file.text();
    return new Blob([text], { type: 'text/markdown' });
  }

  private async convertImage(file: File, format: 'png' | 'jpeg' | 'webp'): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context error')); return; }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image conversion failed')), `image/${format}`, 0.9);
      };
      img.onerror = reject;
      img.src = url;
    });
  }
}
