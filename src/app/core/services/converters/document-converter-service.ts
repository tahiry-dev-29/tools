import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import TurndownService from 'turndown';
import { marked } from 'marked';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentConverterService {
  
  // === HTML Conversions ===

  async htmlToPdf(htmlContent: string): Promise<Blob> {
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.width = '210mm';
    container.style.padding = '20px';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return pdf.output('blob');
    } finally {
      document.body.removeChild(container);
    }
  }

  async htmlToMarkdown(htmlContent: string): Promise<Blob> {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
    const markdown = turndownService.turndown(htmlContent);
    return new Blob([markdown], { type: 'text/markdown' });
  }

  // === Markdown Conversions ===

  async markdownToPdf(markdownContent: string): Promise<Blob> {
    const html = await marked(markdownContent);
    const styledHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        ${html}
      </div>
    `;
    return this.htmlToPdf(styledHtml);
  }

  async markdownToHtml(markdownContent: string): Promise<Blob> {
    const html = await marked(markdownContent);
    return new Blob([html], { type: 'text/html' });
  }

  // === PDF Manipulations ===
  
  async mergePdfs(files: File[]): Promise<Blob> {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const savedPdf = await mergedPdf.save();
    return new Blob([savedPdf as any], { type: 'application/pdf' });
  }

  // === Text Extraction ===

  async pdfToText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
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

  async docxToText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer as any });
    return result.value;
  }
}
