export interface IFileStorageService {
  uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  getFile(key: string): Promise<Buffer | null>;
  deleteFile(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
