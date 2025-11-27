/**
 * Conversion Configuration - Single Source of Truth
 * Using Strategy Pattern to avoid repetitive code
 */

export type FileType = 'pdf' | 'docx' | 'markdown' | 'html' | 'txt' | 'image' | 'video' | 'audio';
export type SupportedFormat = 'pdf' | 'docx' | 'html' | 'md' | 'txt' | 'png' | 'jpeg' | 'webp' | 'mp4' | 'webm' | 'gif' | 'mp3' | 'wav';

/**
 * Conversion Matrix - Defines all possible conversions
 */
export const CONVERSION_MATRIX: Record<FileType, SupportedFormat[]> = {
  // Real Document Conversions
  pdf: ['docx', 'txt', 'html', 'md'], // Text-based conversions
  docx: ['pdf', 'txt', 'html', 'md'], // Text-based conversions
  markdown: ['html', 'pdf', 'txt', 'docx'],
  html: ['pdf', 'md', 'txt', 'docx'],
  txt: ['pdf', 'docx', 'html', 'md'],
  
  // Image Conversions
  image: ['png', 'jpeg', 'webp'],
  
  // Video Conversions
  video: ['mp4', 'webm', 'gif', 'mp3', 'wav'],
  
  // Audio Conversions
  audio: ['mp3', 'wav']
};

/**
 * MIME Type Mapping
 */
export const MIME_TYPES: Record<SupportedFormat, string> = {
  txt: 'text/plain',
  html: 'text/html',
  md: 'text/markdown',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  mp4: 'video/mp4',
  webm: 'video/webm',
  gif: 'image/gif',
  mp3: 'audio/mpeg',
  wav: 'audio/wav'
};

/**
 * File Type Detection Rules
 */
interface FileTypeRule {
  mimeTypes: string[];
  extensions: string[];
  fileType: FileType;
}

export const FILE_TYPE_RULES: FileTypeRule[] = [
  {
    mimeTypes: ['application/pdf'],
    extensions: ['pdf'],
    fileType: 'pdf'
  },
  {
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['docx'],
    fileType: 'docx'
  },
  {
    mimeTypes: ['text/markdown'],
    extensions: ['md', 'markdown'],
    fileType: 'markdown'
  },
  {
    mimeTypes: ['text/html'],
    extensions: ['html', 'htm'],
    fileType: 'html'
  },
  {
    mimeTypes: ['text/plain'],
    extensions: ['txt'],
    fileType: 'txt'
  },
  {
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
    fileType: 'image'
  },
  {
    mimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    extensions: ['mp4', 'webm', 'mkv', 'mov'],
    fileType: 'video'
  },
  {
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-wav'],
    extensions: ['mp3', 'wav', 'ogg', 'aac'],
    fileType: 'audio'
  }
];

/**
 * Default Target Format per File Type
 */
export const DEFAULT_TARGET_FORMAT: Record<FileType, SupportedFormat> = {
  pdf: 'txt',
  docx: 'txt',
  markdown: 'html',
  html: 'pdf',
  txt: 'pdf',
  image: 'webp',
  video: 'mp4',
  audio: 'mp3'
};

/**
 * Detect file type from File object
 */
export function detectFileType(file: File): FileType | null {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  for (const rule of FILE_TYPE_RULES) {
    // Check MIME type
    if (rule.mimeTypes.includes(file.type)) {
      return rule.fileType;
    }
    // Check extension
    if (extension && rule.extensions.includes(extension)) {
      return rule.fileType;
    }
  }
  
  // Fallback for video/audio if MIME type is generic or missing
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('image/')) return 'image';
  
  return null;
}

/**
 * Get available conversion formats for a file
 */
export function getAvailableFormats(file: File): SupportedFormat[] {
  const fileType = detectFileType(file);
  return fileType ? CONVERSION_MATRIX[fileType] : [];
}

/**
 * Get default target format for a file
 */
export function getDefaultTargetFormat(file: File): SupportedFormat | null {
  const fileType = detectFileType(file);
  return fileType ? DEFAULT_TARGET_FORMAT[fileType] : null;
}

/**
 * Get MIME type for a format
 */
export function getMimeType(format: SupportedFormat): string {
  return MIME_TYPES[format] || 'application/octet-stream';
}
