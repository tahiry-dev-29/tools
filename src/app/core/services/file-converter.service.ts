import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

@Injectable({
  providedIn: 'root'
})
export class FileConverterService {

  async convertImage(file: File, format: 'png' | 'jpeg' | 'webp', quality: number = 0.9): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        
        let canvas: HTMLCanvasElement | OffscreenCanvas;
        let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;

        if (typeof OffscreenCanvas !== 'undefined') {
          canvas = new OffscreenCanvas(img.width, img.height);
          ctx = canvas.getContext('2d');
        } else {
          canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx = canvas.getContext('2d');
        }

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        if (canvas instanceof OffscreenCanvas) {
          canvas.convertToBlob({ type: `image/${format}`, quality }).then(blob => resolve(blob));
        } else {
          (canvas as HTMLCanvasElement).toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Conversion failed'));
            },
            `image/${format}`,
            quality
          );
        }
      };

      img.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };

      img.src = url;
    });
  }

  async convertDocument(file: File, format: 'pdf' | 'docx'): Promise<Blob> {
    const text = await file.text();

    if (format === 'pdf') {
      const doc = new jsPDF();
      
      // Split text to fit page width
      const splitText = doc.splitTextToSize(text, 180);
      let y = 10;
      
      // Simple pagination logic
      for (let i = 0; i < splitText.length; i++) {
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
        doc.text(splitText[i], 10, y);
        y += 7;
      }
      
      return doc.output('blob');
    } else {
      // DOCX
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
  }
}
