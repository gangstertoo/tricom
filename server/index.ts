import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/error";
import { connectDB } from "./config/db";
import { env } from "./config/env";

export function createServer() {
  const app = express();

  // Security & misc
  app.use(
    helmet({
      frameguard: false,
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }),
  );
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("tiny"));

  // Health
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // API routes (connect DB only for API)
  app.use("/api", async (_req, _res, next) => {
    try {
      await connectDB();
    } catch (e) {
      // Let error handler handle it on API requests
      return next(e);
    }
    next();
  }, apiRoutes);

  // Errors
  app.use(errorHandler);

  return app;
}
