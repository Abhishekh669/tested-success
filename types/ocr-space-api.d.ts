declare module 'ocr-space-api' {
  interface OCRResult {
    parsedText: string;
    ocrParsedResult: any;
  }

  interface OCROptions {
    apikey: string;
    language?: string;
    imageFormat?: string;
    isOverlayRequired?: boolean;
  }

  export function parseImageFromLocalFile(filePath: string, options: OCROptions): Promise<OCRResult>;
} 