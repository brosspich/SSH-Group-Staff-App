import { env } from "../../config/env.js";
import { IFileStorageService } from "../../core/interfaces/storage.interface.js";
import { Logger } from "../../core/utils/logger.js";

export class CloudflareR2StorageService implements IFileStorageService {
  private bucket: string;
  private publicEndpoint: string;

  constructor() {
    this.bucket = env.R2_BUCKET_NAME || "ssh-group-assets";
    this.publicEndpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${this.bucket}`;
  }

  async uploadFile(
    key: string,
    _buffer: Buffer,
    _mimeType: string,
  ): Promise<string> {
    Logger.info(`[Cloudflare R2] Mock/Real upload initiated for key: ${key}`);
    return this.getPublicUrl(key);
  }

  async getFile(key: string): Promise<Buffer | null> {
    Logger.info(`[Cloudflare R2] Fetching file: ${key}`);
    return null;
  }

  async deleteFile(key: string): Promise<void> {
    Logger.info(`[Cloudflare R2] Deleting file: ${key}`);
  }

  getPublicUrl(key: string): string {
    return `${this.publicEndpoint}/${key}`;
  }
}

export const r2Storage = new CloudflareR2StorageService();
