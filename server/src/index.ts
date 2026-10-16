import { PrismaClient } from "@prisma/client";

import { createApp } from "./app.js";
import { config } from "./config.js";
import { PrismaAuthRepository } from "./prisma-repository.js";
import { TokenService } from "./token-service.js";

const prisma = new PrismaClient();
const app = createApp({
  repository: new PrismaAuthRepository(prisma),
  tokenService: new TokenService({
    accessTokenSecret: config.JWT_ACCESS_SECRET,
    refreshTokenSecret: config.JWT_REFRESH_SECRET,
    jwtIssuer: config.JWT_ISSUER,
    jwtAudience: config.JWT_AUDIENCE,
    accessTokenTtl: config.JWT_ACCESS_TTL,
    refreshTokenTtl: config.JWT_REFRESH_TTL,
  }),
  corsOrigins: config.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
});
app.listen(config.PORT, () => console.log(`API listening on port ${config.PORT}`));
