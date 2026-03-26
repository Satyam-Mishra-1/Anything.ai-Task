import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import "express-async-errors";

import { env } from "./config/env";
import { swaggerSpec } from "./docs/swagger";
import swaggerUi from "swagger-ui-express";
import { v1Router } from "./routes/v1";
import { errorHandler } from "./middleware/error.middleware";

export const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false, // Keep CSP off for simplicity in a demo project.
  })
);

app.use(
  cors({
    origin: env.CORS_ORIGIN,
  })
);

app.use(pinoHttp());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1", v1Router);

app.use(errorHandler);

