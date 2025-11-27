declare module 'mammoth' {
  export interface ConvertToHtmlOptions {
    arrayBuffer: ArrayBuffer;
  }
  
  export interface ExtractRawTextOptions {
    arrayBuffer: ArrayBuffer;
  }
  
  export interface Result {
    value: string;
    messages: any[];
  }

  export function convertToHtml(options: ConvertToHtmlOptions): Promise<Result>;
  export function extractRawText(options: ExtractRawTextOptions): Promise<Result>;
}
