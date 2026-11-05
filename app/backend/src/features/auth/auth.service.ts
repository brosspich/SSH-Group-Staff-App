import { AppError, UnauthorizedError } from "../../core/errors/AppError.js";
import { IAuditLogger } from "../../core/interfaces/audit.interface.js";
import { JwtSigner } from "../../core/utils/jwt.js";
import { PasswordHasher } from "../../core/utils/password.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { auditLogger } from "../../infrastructure/events/eventEmitter.js";
import { formatUserForResponse } from "../users/users.controller.js";
import { LoginInput, RegisterInput } from "./auth.schema.js";

export class AuthService {
  constructor(
    private readonly db = prisma,
    private readonly audit: IAuditLogger = auditLogger,
  ) {}

  async register(input: RegisterInput, ipAddress?: string) {
    const existing = await this.db.user.findFirst({
      where: {
        OR: [
          { username: input.username },
          input.email ? { details: { email: input.email } } : {},
        ],
      },
    });

    if (existing) {
      throw new AppError("Username or email already in use", 409);
    }

    const passwordHash = await PasswordHasher.hash(input.password);
    const cleanId = String(Date.now()).slice(-4);
    const systemId = `system-0001-${cleanId}`;

    const user = await this.db.user.create({
      data: {
        systemId,
        id: cleanId,
        username: input.username,
        passwordHash,
        role: input.role,
        details: {
          create: {
            companyId: "system-0001",
            email: input.email,
            name: input.name,
          },
        },
      },
      include: {
        details: { include: { company: true } },
      },
    });

    await this.audit.log({
      action: "USER_REGISTERED",
      actorId: user.systemId,
      actorName: user.username,
      targetId: user.systemId,
      ipAddress,
    });

    const token = JwtSigner.sign({
      userId: user.systemId,
      username: user.username,
      role: user.role,
    });

    return {
      user: formatUserForResponse(user),
      token,
    };
  }

  async login(input: LoginInput, ipAddress?: string) {
    const cleanUsername = (input.username || "").trim();
    const cleanLower = cleanUsername.toLowerCase();

    // 1. Find user by systemId, id (staff id), username, or email
    const user = await this.db.user.findFirst({
      where: {
        OR: [
          { systemId: cleanUsername },
          { id: cleanUsername },
          { username: cleanUsername },
          { username: cleanLower },
          { details: { email: cleanUsername } },
          { details: { email: cleanLower } },
        ],
      },
      include: {
        details: {
          include: { company: true },
        },
        deviceSessions: true,
        attendanceLogs: true,
        attendanceRequests: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid username or password.");
    }

    // Backend Condition: Inactive account
    if (!user.isActive) {
      throw new UnauthorizedError("Your account is inactive. Contact admin.");
    }

    // Backend Condition: Leave / Suspended account
    const userRole = String(user.role || "").toLowerCase();
    if (userRole.includes("leave")) {
      throw new UnauthorizedError("Your account is on leave. Contact admin.");
    }
    if (userRole.includes("suspended")) {
      throw new UnauthorizedError("Your account is suspended. Contact admin.");
    }

    // 2. Validate password (Plaintext or Bcrypt Hash)
    const rawStored = user.passwordHash || "";
    const rawInput = (input.password || "").trim();
    let isValid = false;

    if (rawStored.trim() === rawInput) {
      isValid = true;
    } else if (rawStored.startsWith("$2")) {
      const normalizedHash = rawStored.replace(/^\$2y\$/, "$2a$");
      try {
        isValid = await PasswordHasher.compare(rawInput, normalizedHash);
      } catch {
        isValid = false;
      }
    }

    if (!isValid) {
      throw new UnauthorizedError("Invalid username or password.");
    }

    const token = JwtSigner.sign({
      userId: user.systemId,
      username: user.username,
      role: user.role,
    });

    try {
      await this.audit.log({
        action: "USER_LOGIN",
        actorId: user.systemId,
        actorName: user.username,
        targetId: user.systemId,
        ipAddress,
      });
    } catch {}

    return {
      user: formatUserForResponse(user),
      token,
    };
  }
}

export const authService = new AuthService();
