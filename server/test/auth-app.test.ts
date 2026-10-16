import { createHash } from "node:crypto";

import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { TokenService } from "../src/token-service.js";

const config = {
  accessTokenSecret: "access-secret-for-tests",
  refreshTokenSecret: "refresh-secret-for-tests",
  jwtIssuer: "expo-auth-starter",
  jwtAudience: "expo-auth-starter-mobile",
  accessTokenTtl: "15m",
  refreshTokenTtl: "7d",
};

class MemoryRepository {
  users = new Map<string, { id: string; email: string; passwordHash: string }>();
  sessions = new Map<string, { tokenHash: string; userId: string; expiresAt: Date; revokedAt: Date | null }>();

  async findUserByEmail(email: string) {
    return [...this.users.values()].find((user) => user.email === email) ?? null;
  }

  async findUserById(id: string) {
    return this.users.get(id) ?? null;
  }

  async createUser(email: string, passwordHash: string) {
    const user = { id: crypto.randomUUID(), email, passwordHash };
    this.users.set(user.id, user);
    return user;
  }

  async createSession(session: { tokenHash: string; userId: string; expiresAt: Date }) {
    this.sessions.set(session.tokenHash, { ...session, revokedAt: null });
  }

  async consumeSession(tokenHash: string) {
    const session = this.sessions.get(tokenHash);
    if (!session || session.revokedAt || session.expiresAt <= new Date()) return null;
    session.revokedAt = new Date();
    return session;
  }

  async revokeSession(tokenHash: string) {
    const session = this.sessions.get(tokenHash);
    if (session) session.revokedAt = new Date();
  }
}

describe("auth API", () => {
  let repository: MemoryRepository;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    repository = new MemoryRepository();
    app = createApp({ repository, tokenService: new TokenService(config), authRateLimit: false });
  });

  it("registers, authenticates, refreshes, and revokes a user session", async () => {
    const registration = await request(app).post("/auth/register").send({
      email: "Person@Example.com ",
      password: "correct-horse-battery-staple",
    });

    expect(registration.status).toBe(201);
    expect(registration.body.user).toEqual({ id: expect.any(String), email: "person@example.com" });
    expect(registration.body.tokens.accessToken).toEqual(expect.any(String));
    expect(registration.body).not.toHaveProperty("passwordHash");

    const me = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${registration.body.tokens.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body).toEqual({ user: registration.body.user });

    const refresh = await request(app).post("/auth/refresh").send({ refreshToken: registration.body.tokens.refreshToken });
    expect(refresh.status).toBe(200);
    expect(refresh.body.tokens.refreshToken).not.toBe(registration.body.tokens.refreshToken);

    const replay = await request(app).post("/auth/refresh").send({ refreshToken: registration.body.tokens.refreshToken });
    expect(replay.status).toBe(401);

    const logout = await request(app).post("/auth/logout").send({ refreshToken: refresh.body.tokens.refreshToken });
    expect(logout.status).toBe(204);

    const afterLogout = await request(app).post("/auth/refresh").send({ refreshToken: refresh.body.tokens.refreshToken });
    expect(afterLogout.status).toBe(401);
  });

  it("does not expose whether an email exists during invalid login", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "missing@example.com",
      password: "correct-horse-battery-staple",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid email or password." });
  });

  it("rejects duplicate email after normalization", async () => {
    await request(app).post("/auth/register").send({ email: "person@example.com", password: "correct-horse-battery-staple" });

    const duplicate = await request(app)
      .post("/auth/register")
      .send({ email: " Person@Example.com ", password: "correct-horse-battery-staple" });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body).toEqual({ error: "An account already uses this email." });
  });
});
