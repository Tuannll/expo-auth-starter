import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { TokenService } from "./token-service.js";

export type SafeUser = { id: string; email: string };
type StoredUser = SafeUser & { passwordHash: string };

export type AuthRepository = {
  findUserByEmail(email: string): Promise<StoredUser | null>;
  findUserById(id: string): Promise<StoredUser | null>;
  createUser(email: string, passwordHash: string): Promise<StoredUser>;
  createSession(session: { tokenHash: string; userId: string; expiresAt: Date }): Promise<void>;
  consumeSession(tokenHash: string): Promise<{ userId: string } | null>;
  revokeSession(tokenHash: string): Promise<void>;
};

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}

  async register(email: string, password: string) {
    if (await this.repository.findUserByEmail(email)) return null;
    const user = await this.repository.createUser(email, await bcrypt.hash(password, 12));
    return this.createSession(user);
  }

  async login(email: string, password: string) {
    const user = await this.repository.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
    return this.createSession(user);
  }

  async refresh(refreshToken: string) {
    const payload = this.tokenService.verifyRefresh(refreshToken);
    const session = await this.repository.consumeSession(this.tokenService.hash(refreshToken));
    if (!session || session.userId !== payload.sub) throw new Error("Invalid refresh token");
    const user = await this.repository.findUserById(session.userId);
    if (!user) throw new Error("Invalid refresh token");
    return this.createSession(user);
  }

  async logout(refreshToken: string) {
    this.tokenService.verifyRefresh(refreshToken);
    await this.repository.revokeSession(this.tokenService.hash(refreshToken));
  }

  async getUser(accessToken: string) {
    const payload = this.tokenService.verifyAccess(accessToken);
    const user = await this.repository.findUserById(payload.sub ?? "");
    return user ? this.safeUser(user) : null;
  }

  private async createSession(user: SafeUser) {
    const tokens = this.tokenService.issue(user);
    const payload = jwt.decode(tokens.refreshToken) as jwt.JwtPayload;
    await this.repository.createSession({
      userId: user.id,
      tokenHash: this.tokenService.hash(tokens.refreshToken),
      expiresAt: new Date((payload.exp ?? 0) * 1000),
    });
    return { user: this.safeUser(user), tokens };
  }

  private safeUser(user: SafeUser): SafeUser {
    return { id: user.id, email: user.email };
  }
}
