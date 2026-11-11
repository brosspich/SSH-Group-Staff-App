import { NotFoundError } from "../../core/errors/AppError.js";
import { IAuditLogger } from "../../core/interfaces/audit.interface.js";
import { IRepository } from "../../core/interfaces/repository.interface.js";
import { auditLogger } from "../../infrastructure/events/eventEmitter.js";
import { serverGroupRepository } from "./server-group.repository.js";
import {
  CreateServerGroupDTO,
  ServerGroupModel,
  UpdateServerGroupDTO,
} from "./server-group.types.js";

export class ServerGroupService {
  constructor(
    private readonly repo: IRepository<
      ServerGroupModel,
      CreateServerGroupDTO,
      UpdateServerGroupDTO
    > = serverGroupRepository,
    private readonly audit: IAuditLogger = auditLogger,
  ) {}

  async getAll(): Promise<ServerGroupModel[]> {
    return await this.repo.findAll();
  }

  async getById(id: string): Promise<ServerGroupModel> {
    const group = await this.repo.findById(id);
    if (!group) {
      throw new NotFoundError(`Server Group with ID ${id} was not found`);
    }
    return group;
  }

  async create(
    data: CreateServerGroupDTO,
    actorId: string,
    actorName: string,
  ): Promise<ServerGroupModel> {
    const group = await this.repo.create(data);
    await this.audit.log({
      action: "SSH_GROUP_CREATED",
      actorId,
      actorName,
      targetId: group.id,
      details: { name: group.name },
    });
    return group;
  }

  async update(
    id: string,
    data: UpdateServerGroupDTO,
    actorId: string,
    actorName: string,
  ): Promise<ServerGroupModel> {
    await this.getById(id);
    const updated = await this.repo.update(id, data);
    await this.audit.log({
      action: "SSH_GROUP_UPDATED",
      actorId,
      actorName,
      targetId: id,
      details: { changes: data },
    });
    return updated;
  }

  async delete(id: string, actorId: string, actorName: string): Promise<void> {
    const group = await this.getById(id);
    await this.repo.delete(id);
    await this.audit.log({
      action: "SSH_GROUP_DELETED",
      actorId,
      actorName,
      targetId: id,
      details: { name: group.name },
    });
  }
}

export const serverGroupService = new ServerGroupService();

// Backwards-compatible aliases
export const SshGroupService = ServerGroupService;
export const sshGroupService = serverGroupService;
