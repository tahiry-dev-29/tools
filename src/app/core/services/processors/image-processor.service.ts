import { Injectable } from '@angular/core';

export type ImageFilter = 'grayscale' | 'sepia' | 'invert';
export type RotationAngle = 90 | 180 | 270;

@Injectable({
  providedIn: 'root'
})
export class ImageProcessorService {

  /**
   * Apply grayscale filter to image
   */
  async applyGrayscale(file: File): Promise<Blob> {
    return this.applyFilter(file, 'grayscale');
  }

  /**
   * Apply sepia filter to image
   */
  async applySepia(file: File): Promise<Blob> {
    return this.applyFilter(file, 'sepia');
  }

  /**
   * Invert image colors
   */
  async invertColors(file: File): Promise<Blob> {
    return this.applyFilter(file, 'invert');
  }

  /**
   * Rotate image by specified angle
   */
  async rotateImage(file: File, angle: RotationAngle): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Adjust canvas size based on rotation
        if (angle === 90 || angle === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        // Apply rotation
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Rotation failed'));
        }, file.type);
      };

      img.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };

      img.src = url;
    });
  }

  /**
   * Generic filter application
   */
  private async applyFilter(file: File, filter: ImageFilter): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply filter
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          switch (filter) {
            case 'grayscale':
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              data[i] = data[i + 1] = data[i + 2] = gray;
              break;

            case 'sepia':
              data[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
              data[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
              data[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
              break;

            case 'invert':
              data[i] = 255 - r;
              data[i + 1] = 255 - g;
              data[i + 2] = 255 - b;
              break;
          }
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Filter application failed'));
        }, file.type);
      };

      img.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };

      img.src = url;
    });
  }
}
