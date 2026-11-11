import { IRepository } from "../../core/interfaces/repository.interface.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import {
  CreateServerGroupDTO,
  ServerGroupModel,
  UpdateServerGroupDTO,
} from "./server-group.types.js";

export class ServerGroupRepository implements IRepository<
  ServerGroupModel,
  CreateServerGroupDTO,
  UpdateServerGroupDTO
> {
  constructor(private readonly db = prisma) {}

  async findById(id: string): Promise<ServerGroupModel | null> {
    return await this.db.serverGroup.findUnique({
      where: { id },
    });
  }

  async findAll(filter?: Record<string, unknown>): Promise<ServerGroupModel[]> {
    return await this.db.serverGroup.findMany({
      where: filter as any,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: CreateServerGroupDTO): Promise<ServerGroupModel> {
    return await this.db.serverGroup.create({
      data: {
        name: data.name,
        description: data.description,
        serverCount: data.serverCount ?? 0,
      },
    });
  }

  async update(
    id: string,
    data: UpdateServerGroupDTO,
  ): Promise<ServerGroupModel> {
    return await this.db.serverGroup.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.serverGroup.delete({
      where: { id },
    });
  }
}

export const serverGroupRepository = new ServerGroupRepository();
