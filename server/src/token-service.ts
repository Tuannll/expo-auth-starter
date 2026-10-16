import { createHash, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

export type TokenConfig = {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  jwtIssuer: string;
  jwtAudience: string;
  accessTokenTtl: string;
  refreshTokenTtl: string;
};

type UserIdentity = { id: string; email: string };
type TokenPayload = jwt.JwtPayload & { email: string; type: "access" | "refresh" };

export class TokenService {
  constructor(private readonly config: TokenConfig) {}

  issue(user: UserIdentity) {
    const base = { sub: user.id, email: user.email, iss: this.config.jwtIssuer, aud: this.config.jwtAudience };

    return {
      accessToken: jwt.sign({ ...base, type: "access" }, this.config.accessTokenSecret, {
        expiresIn: this.config.accessTokenTtl as jwt.SignOptions["expiresIn"],
      }),
      refreshToken: jwt.sign({ ...base, jti: randomUUID(), type: "refresh" }, this.config.refreshTokenSecret, {
        expiresIn: this.config.refreshTokenTtl as jwt.SignOptions["expiresIn"],
      }),
    };
  }

  verifyAccess(token: string): TokenPayload {
    return this.verify(token, this.config.accessTokenSecret, "access") as TokenPayload;
  }

  verifyRefresh(token: string): TokenPayload {
    return this.verify(token, this.config.refreshTokenSecret, "refresh") as TokenPayload;
  }

  hash(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private verify(token: string, secret: string, type: TokenPayload["type"]) {
    try {
      const payload = jwt.verify(token, secret, {
        issuer: this.config.jwtIssuer,
        audience: this.config.jwtAudience,
      }) as TokenPayload;
      if (payload.type !== type) throw new Error("wrong token type");
      return payload;
    } catch {
      throw new Error(`Invalid ${type} token`);
    }
  }
}
