import { IRepository } from "../../core/interfaces/repository.interface.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import {
  CreateSshGroupDTO,
  SshGroupModel,
  UpdateSshGroupDTO,
} from "./ssh-group.types.js";

export class SshGroupRepository implements IRepository<
  SshGroupModel,
  CreateSshGroupDTO,
  UpdateSshGroupDTO
> {
  constructor(private readonly db = prisma) {}

  async findById(id: string): Promise<SshGroupModel | null> {
    return await this.db.sshGroup.findUnique({
      where: { id },
    });
  }

  async findAll(filter?: Record<string, unknown>): Promise<SshGroupModel[]> {
    return await this.db.sshGroup.findMany({
      where: filter as any,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: CreateSshGroupDTO): Promise<SshGroupModel> {
    return await this.db.sshGroup.create({
      data: {
        name: data.name,
        description: data.description,
        serverCount: data.serverCount ?? 0,
      },
    });
  }

  async update(id: string, data: UpdateSshGroupDTO): Promise<SshGroupModel> {
    return await this.db.sshGroup.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.sshGroup.delete({
      where: { id },
    });
  }
}

export const sshGroupRepository = new SshGroupRepository();
