import { NotFoundError } from "../../core/errors/AppError.js";
import { IAuditLogger } from "../../core/interfaces/audit.interface.js";
import { IRepository } from "../../core/interfaces/repository.interface.js";
import { auditLogger } from "../../infrastructure/events/eventEmitter.js";
import { sshGroupRepository } from "./ssh-group.repository.js";
import {
  CreateSshGroupDTO,
  SshGroupModel,
  UpdateSshGroupDTO,
} from "./ssh-group.types.js";

export class SshGroupService {
  constructor(
    private readonly repo: IRepository<
      SshGroupModel,
      CreateSshGroupDTO,
      UpdateSshGroupDTO
    > = sshGroupRepository,
    private readonly audit: IAuditLogger = auditLogger,
  ) {}

  async getAll(): Promise<SshGroupModel[]> {
    return await this.repo.findAll();
  }

  async getById(id: string): Promise<SshGroupModel> {
    const group = await this.repo.findById(id);
    if (!group) {
      throw new NotFoundError(`SSH Group with ID ${id} was not found`);
    }
    return group;
  }

  async create(
    data: CreateSshGroupDTO,
    actorId: string,
    actorName: string,
  ): Promise<SshGroupModel> {
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
    data: UpdateSshGroupDTO,
    actorId: string,
    actorName: string,
  ): Promise<SshGroupModel> {
    await this.getById(id);
    const updated = await this.repo.update(id, data);
    await this.audit.log({
      action: "SSH_GROUP_UPDATED",
      actorId,
      actorName,
      targetId: id,
      details: data,
    });
    return updated;
  }

  async delete(id: string, actorId: string, actorName: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
    await this.audit.log({
      action: "SSH_GROUP_DELETED",
      actorId,
      actorName,
      targetId: id,
    });
  }
}

export const sshGroupService = new SshGroupService();
