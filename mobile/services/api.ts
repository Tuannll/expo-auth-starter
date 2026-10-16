const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type AuthResponse = {
  user: { id: string; email: string };
  tokens: { accessToken: string; refreshToken: string };
};

export function isUnauthorized(error: unknown) {
  return error instanceof ApiError ? error.status === 401 : error instanceof Error && error.message === "Unauthorized";
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiUrl) throw new Error("EXPO_PUBLIC_API_URL is not configured.");
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(body?.error ?? "Request failed.", response.status);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export const authApi = {
  register: (email: string, password: string) =>
    fetchJson<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    fetchJson<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  refresh: (refreshToken: string) =>
    fetchJson<AuthResponse>("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) }),
  logout: (refreshToken: string) =>
    fetchJson<void>("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) }),
  me: (accessToken: string) =>
    fetchJson<{ user: AuthResponse["user"] }>("/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } }),
};

export function createRefreshCoordinator(refresh: () => Promise<string>) {
  let activeRefresh: Promise<string> | null = null;

  const getAccessToken = () => {
    activeRefresh ??= refresh().finally(() => {
      activeRefresh = null;
    });
    return activeRefresh;
  };

  return <T>(request: (accessToken: string) => Promise<T>, accessToken: string) =>
    requestWithRefresh({ request, refresh: getAccessToken, accessToken });
}

export async function requestWithRefresh<T>({
  request,
  refresh,
  accessToken,
}: {
  request: (accessToken: string) => Promise<T>;
  refresh: () => Promise<string>;
  accessToken: string;
}) {
  try {
    return await request(accessToken);
  } catch (error) {
    if (!isUnauthorized(error)) throw error;
    return request(await refresh());
  }
}
