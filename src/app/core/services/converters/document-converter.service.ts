import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { marked } from 'marked';

// Configure PDF.js worker - use worker from assets
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentConverterService {

  /**
   * Extract text from PDF file
   */
  async pdfToText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  }

  /**
   * Extract text from DOCX file
   */
  async docxToText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  /**
   * Convert Markdown to HTML
   */
  async markdownToHtml(file: File): Promise<string> {
    const text = await file.text();
    return marked(text) as string;
  }

  /**
   * Convert Markdown to HTML from string
   */
  markdownStringToHtml(markdown: string): string {
    return marked(markdown) as string;
  }
}
