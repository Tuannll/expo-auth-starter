import { describe, expect, it } from "vitest";

import { ApiError, createRefreshCoordinator, isUnauthorized, requestWithRefresh } from "./api";

describe("requestWithRefresh", () => {
  it("refreshes once then retries an unauthorized protected request", async () => {
    let calls = 0;
    let refreshes = 0;

    const result = await requestWithRefresh({
      request: async (accessToken) => {
        calls += 1;
        if (accessToken !== "fresh-access-token") throw new Error("Unauthorized");
        return "profile";
      },
      refresh: async () => {
        refreshes += 1;
        return "fresh-access-token";
      },
      accessToken: "expired-access-token",
    });

    expect(result).toBe("profile");
    expect(calls).toBe(2);
    expect(refreshes).toBe(1);
  });

  it("detects unauthorized API errors", () => {
    expect(isUnauthorized(new ApiError("Unauthorized.", 401))).toBe(true);
    expect(isUnauthorized(new Error("Unauthorized"))).toBe(true);
  });

  it("shares one refresh while concurrent requests retry", async () => {
    let refreshes = 0;
    const authorizedRequest = createRefreshCoordinator(async () => {
      refreshes += 1;
      return "fresh-access-token";
    });

    const request = (accessToken: string) =>
      accessToken === "fresh-access-token" ? Promise.resolve("profile") : Promise.reject(new Error("Unauthorized"));

    await expect(Promise.all([authorizedRequest(request, "expired"), authorizedRequest(request, "expired")])).resolves.toEqual(["profile", "profile"]);
    expect(refreshes).toBe(1);
  });
});
