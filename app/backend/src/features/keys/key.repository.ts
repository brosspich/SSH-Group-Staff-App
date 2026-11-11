import { ServerKey } from "@prisma/client";
import { prisma } from "../../infrastructure/database/prisma.js";

export class KeyRepository {
  constructor(private readonly db = prisma) {}

  async findByUserId(userId: string): Promise<ServerKey[]> {
    return await this.db.serverKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<ServerKey | null> {
    return await this.db.serverKey.findUnique({
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
  }): Promise<ServerKey> {
    return await this.db.serverKey.create({
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.serverKey.delete({
      where: { id },
    });
  }
}

export const keyRepository = new KeyRepository();
