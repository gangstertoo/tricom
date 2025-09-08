import { RequestHandler } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

const scrypt = promisify(_scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const key = Buffer.from(keyHex, "hex");
  const derived = await scrypt(password, salt, key.length);
  return timingSafeEqual(key, derived);
}

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

export const register: RequestHandler = async (req, res) => {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { email, password, name } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "Email already in use" });
  const passwordHash = await hashPassword(password);
  const user = new User({ email, name: name || email, passwordHash });
  await user.save();
  const token = jwt.sign({ sub: user._id.toString(), email: user.email }, env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
};

export const login: RequestHandler = async (req, res) => {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash)
    return res.status(401).json({ error: "Invalid credentials" });
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ sub: user._id.toString(), email: user.email }, env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
};
