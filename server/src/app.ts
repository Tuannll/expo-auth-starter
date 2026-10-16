import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";

import { AuthRepository, AuthService } from "./auth-service.js";
import { TokenService } from "./token-service.js";

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(12).max(128),
});
const refreshSchema = z.object({ refreshToken: z.string().min(1) });

export function createApp({
  repository,
  tokenService,
  authRateLimit = true,
  corsOrigins = [],
}: {
  repository: AuthRepository;
  tokenService: TokenService;
  authRateLimit?: boolean;
  corsOrigins?: string[];
}) {
  const app = express();
  const authService = new AuthService(repository, tokenService);

  app.disable("x-powered-by");
  app.use(helmet());
  if (corsOrigins.length) app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: "10kb" }));
  if (authRateLimit) app.use("/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false }));

  app.post("/auth/register", async (request, response, next) => {
    try {
      const { email, password } = credentialsSchema.parse(request.body);
      const result = await authService.register(email, password);
      if (!result) return response.status(409).json({ error: "An account already uses this email." });
      return response.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  });

  app.post("/auth/login", async (request, response, next) => {
    try {
      const { email, password } = credentialsSchema.parse(request.body);
      const result = await authService.login(email, password);
      if (!result) return response.status(401).json({ error: "Invalid email or password." });
      return response.json(result);
    } catch (error) {
      return next(error);
    }
  });

  app.post("/auth/refresh", async (request, response, next) => {
    try {
      const { refreshToken } = refreshSchema.parse(request.body);
      return response.json(await authService.refresh(refreshToken));
    } catch (error) {
      return next(error);
    }
  });

  app.post("/auth/logout", async (request, response, next) => {
    try {
      const { refreshToken } = refreshSchema.parse(request.body);
      await authService.logout(refreshToken);
      return response.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  app.get("/auth/me", async (request, response, next) => {
    try {
      const token = request.header("authorization")?.replace(/^Bearer\s+/i, "");
      if (!token) return response.status(401).json({ error: "Unauthorized." });
      const user = await authService.getUser(token);
      if (!user) return response.status(401).json({ error: "Unauthorized." });
      return response.json({ user });
    } catch (error) {
      return next(error);
    }
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof z.ZodError) return response.status(400).json({ error: "Invalid request." });
    if (error instanceof Error && error.message.startsWith("Invalid ")) return response.status(401).json({ error: "Unauthorized." });
    return response.status(500).json({ error: "Internal server error." });
  });

  return app;
}
