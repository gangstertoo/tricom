import "dotenv/config";

export interface Env {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  CLIENT_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
}

function required(name: keyof Env, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable: ${String(name)}`);
  return value;
}

export const env: Env = {
  NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) || "development",
  PORT: Number(process.env.PORT || 8080),
  MONGO_URI: required("MONGO_URI", process.env.MONGO_URI),
  JWT_SECRET: required("JWT_SECRET", process.env.JWT_SECRET),
  CLIENT_URL: required("CLIENT_URL", process.env.CLIENT_URL),
  GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID),
  GOOGLE_CLIENT_SECRET: required(
    "GOOGLE_CLIENT_SECRET",
    process.env.GOOGLE_CLIENT_SECRET,
  ),
  GOOGLE_REDIRECT_URI: required(
    "GOOGLE_REDIRECT_URI",
    process.env.GOOGLE_REDIRECT_URI,
  ),
};
