import { prisma } from '../../infrastructure/database/prisma.js';
import { SshKey } from '@prisma/client';

export class KeyRepository {
  constructor(private readonly db = prisma) {}

  async findByUserId(userId: string): Promise<SshKey[]> {
    return await this.db.sshKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<SshKey | null> {
    return await this.db.sshKey.findUnique({
      where: { id },
    });
  }

  async create(data: {
    userId: string;
    name: string;
    publicKey: string;
    fingerprint: string;
    keyType: string;
    expiresAt?: Date;
  }): Promise<SshKey> {
    return await this.db.sshKey.create({
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.sshKey.delete({
      where: { id },
    });
  }
}

export const keyRepository = new KeyRepository();
