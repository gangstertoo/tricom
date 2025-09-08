import "dotenv/config";

export interface Env {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  MONGO_URI: string | undefined;
  JWT_SECRET: string;
  CLIENT_URL: string;
  GOOGLE_CLIENT_ID: string | undefined;
  GOOGLE_CLIENT_SECRET: string | undefined;
  GOOGLE_REDIRECT_URI: string | undefined;
}

export const env: Env = {
  NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) || "development",
  PORT: Number(process.env.PORT || 8080),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:8080",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
};

export function ensureGoogleEnv() {
  if (
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET ||
    !env.GOOGLE_REDIRECT_URI
  ) {
    throw new Error("Google OAuth environment variables are not configured");
  }
}
