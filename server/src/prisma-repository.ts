import { PrismaClient } from "@prisma/client";

import { AuthRepository } from "./auth-service.js";

export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createUser(email: string, passwordHash: string) {
    return this.prisma.user.create({ data: { email, passwordHash } });
  }

  async createSession(session: { tokenHash: string; userId: string; expiresAt: Date }) {
    await this.prisma.refreshSession.create({ data: session });
  }

  async consumeSession(tokenHash: string) {
    const result = await this.prisma.refreshSession.updateMany({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      data: { revokedAt: new Date() },
    });
    if (result.count !== 1) return null;
    return this.prisma.refreshSession.findUnique({ where: { tokenHash }, select: { userId: true } });
  }

  async revokeSession(tokenHash: string) {
    await this.prisma.refreshSession.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
  }
}
