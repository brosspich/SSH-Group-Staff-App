export type KeyType = "ED25519" | "RSA" | "ECDSA";

export interface SshKey {
  id: string;
  name: string;
  fingerprint: string;
  publicKey: string;
  type: KeyType;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
}

export interface UploadKeyDTO {
  name: string;
  publicKey: string;
  expiresInDays?: number;
}
