import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/error";
import { connectDB } from "./config/db";

export function createServer() {
  const app = express();

  // Security & misc
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("tiny"));

  // Health
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // Connect DB lazily on first request
  app.use(async (_req, _res, next) => {
    await connectDB();
    next();
  });

  // API routes
  app.use("/api", apiRoutes);

  // Errors
  app.use(errorHandler);

  return app;
}
