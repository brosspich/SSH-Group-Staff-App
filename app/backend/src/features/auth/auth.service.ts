import { prisma } from '../../infrastructure/database/prisma.js';
import { PasswordHasher } from '../../core/utils/password.js';
import { JwtSigner } from '../../core/utils/jwt.js';
import { UnauthorizedError, AppError } from '../../core/errors/AppError.js';
import { IAuditLogger } from '../../core/interfaces/audit.interface.js';
import { auditLogger } from '../../infrastructure/events/eventEmitter.js';
import { LoginInput, RegisterInput } from './auth.schema.js';

export class AuthService {
  constructor(
    private readonly db = prisma,
    private readonly audit: IAuditLogger = auditLogger
  ) {}

  async register(input: RegisterInput, ipAddress?: string) {
    const existing = await this.db.user.findFirst({
      where: {
        OR: [{ username: input.username }, input.email ? { email: input.email } : {}],
      },
    });

    if (existing) {
      throw new AppError('Username or email already in use', 409);
    }

    const passwordHash = await PasswordHasher.hash(input.password);
    const user = await this.db.user.create({
      data: {
        username: input.username,
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
      },
    });

    await this.audit.log({
      action: 'USER_REGISTERED',
      actorId: user.id,
      actorName: user.username,
      targetId: user.id,
      ipAddress,
    });

    const token = JwtSigner.sign({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  async login(input: LoginInput, ipAddress?: string) {
    const user = await this.db.user.findUnique({
      where: { username: input.username },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials or account deactivated');
    }

    const isValid = await PasswordHasher.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = JwtSigner.sign({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    await this.audit.log({
      action: 'USER_LOGIN',
      actorId: user.id,
      actorName: user.username,
      targetId: user.id,
      ipAddress,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }
}

export const authService = new AuthService();
