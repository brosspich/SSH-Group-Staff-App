import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../../config/env.js";
import { IFileStorageService } from "../../core/interfaces/storage.interface.js";
import { Logger } from "../../core/utils/logger.js";

export class CloudflareR2StorageService implements IFileStorageService {
  private bucket: string;
  private s3Client: S3Client | null = null;
  private publicEndpoint: string;

  constructor() {
    this.bucket = env.R2_BUCKET_NAME as string;
    const accountId = env.R2_ACCOUNT_ID;
    const accessKeyId = env.R2_ACCESS_KEY_ID;
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

    if (accountId && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        forcePathStyle: true,
      });
    } else {
      Logger.warn(
        "[Cloudflare R2] Missing R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).",
      );
    }

    this.publicEndpoint = `https://${accountId}.r2.cloudflarestorage.com/${this.bucket}`;
  }

  async uploadFile(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    Logger.info(
      `[Cloudflare R2] Uploading key: ${key} to bucket: ${this.bucket}`,
    );

    if (this.s3Client) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );
      Logger.info(`[Cloudflare R2] Upload success for key: ${key}`);
    } else {
      Logger.warn(
        `[Cloudflare R2] S3 Client credentials missing, returning mock public url for: ${key}`,
      );
    }

    return this.getPublicUrl(key);
  }

  async getFile(key: string): Promise<Buffer | null> {
    if (!this.s3Client) return null;
    try {
      const res = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      if (res.Body) {
        const byteArray = await res.Body.transformToByteArray();
        return Buffer.from(byteArray);
      }
    } catch (e) {
      Logger.error(`[Cloudflare R2] Error fetching key: ${key}`, e);
    }
    return null;
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.s3Client) return;
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (e) {
      Logger.error(`[Cloudflare R2] Error deleting key: ${key}`, e);
    }
  }

  getPublicUrl(key: string): string {
    return `${this.publicEndpoint}/${key}`;
  }
}

export const r2Storage = new CloudflareR2StorageService();
