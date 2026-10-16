import { describe, expect, it } from "vitest";

import { TokenService } from "../src/token-service.js";

const config = {
  accessTokenSecret: "access-secret-for-tests",
  refreshTokenSecret: "refresh-secret-for-tests",
  jwtIssuer: "expo-auth-starter",
  jwtAudience: "expo-auth-starter-mobile",
  accessTokenTtl: "15m",
  refreshTokenTtl: "7d",
};

describe("TokenService", () => {
  it("issues distinct token types and rejects refresh token as access token", () => {
    const tokens = new TokenService(config).issue({ id: "user-1", email: "person@example.com" });
    const service = new TokenService(config);

    expect(service.verifyAccess(tokens.accessToken)).toMatchObject({
      sub: "user-1",
      email: "person@example.com",
      type: "access",
    });
    expect(() => service.verifyAccess(tokens.refreshToken)).toThrow("Invalid access token");
  });

  it("creates a stable hash for refresh-token lookup", () => {
    const service = new TokenService(config);

    expect(service.hash("refresh-token")).toBe(service.hash("refresh-token"));
    expect(service.hash("refresh-token")).not.toBe(service.hash("another-token"));
  });
});
