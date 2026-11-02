import crypto from "crypto";
import { ForbiddenError, NotFoundError } from "../../core/errors/AppError.js";
import { IAuditLogger } from "../../core/interfaces/audit.interface.js";
import { IFileStorageService } from "../../core/interfaces/storage.interface.js";
import { auditLogger } from "../../infrastructure/events/eventEmitter.js";
import { r2Storage } from "../../infrastructure/storage/r2.service.js";
import { KeyRepository, keyRepository } from "./key.repository.js";
import { UploadKeyInput } from "./key.schema.js";

export class KeyService {
  constructor(
    private readonly repo: KeyRepository = keyRepository,
    private readonly audit: IAuditLogger = auditLogger,
    private readonly storage: IFileStorageService = r2Storage,
  ) {}

  private calculateFingerprint(publicKey: string): string {
    const parts = publicKey.trim().split(" ");
    const keyData = parts.length > 1 ? parts[1] : parts[0];
    const hash = crypto
      .createHash("sha256")
      .update(Buffer.from(keyData, "base64"))
      .digest("base64");
    return `SHA256:${hash.replace(/=+$/, "")}`;
  }

  async getUserKeys(userId: string) {
    return await this.repo.findByUserId(userId);
  }

  async uploadKey(
    userId: string,
    username: string,
    input: UploadKeyInput,
    ipAddress?: string,
  ) {
    const fingerprint = this.calculateFingerprint(input.publicKey);

    let expiresAt: Date | undefined;
    if (input.expiresInDays) {
      expiresAt = new Date(
        Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000,
      );
    }

    const key = await this.repo.create({
      userId,
      name: input.name,
      publicKey: input.publicKey,
      fingerprint,
      keyType: input.keyType,
      expiresAt,
    });

    // Backup to Cloudflare R2 (Architecture requirement)
    const backupKey = `ssh-keys/${userId}/${key.id}.pub`;
    await this.storage.uploadFile(
      backupKey,
      Buffer.from(input.publicKey),
      "text/plain",
    );

    await this.audit.log({
      action: "KEY_UPLOADED",
      actorId: userId,
      actorName: username,
      targetId: key.id,
      details: { name: key.name, fingerprint },
      ipAddress,
    });

    return key;
  }

  async revokeKey(
    keyId: string,
    userId: string,
    username: string,
    userRole: string,
    ipAddress?: string,
  ) {
    const key = await this.repo.findById(keyId);
    if (!key) {
      throw new NotFoundError("SSH Key not found");
    }

    if (key.userId !== userId && userRole !== "admin") {
      throw new ForbiddenError("You can only revoke your own SSH keys");
    }

    await this.repo.delete(keyId);

    // Delete backup archive from R2
    const backupKey = `ssh-keys/${userId}/${key.id}.pub`;
    await this.storage.deleteFile(backupKey);

    await this.audit.log({
      action: "KEY_REVOKED",
      actorId: userId,
      actorName: username,
      targetId: keyId,
      details: { name: key.name, fingerprint: key.fingerprint },
      ipAddress,
    });
  }
}

export const keyService = new KeyService();
