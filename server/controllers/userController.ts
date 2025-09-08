import { RequestHandler } from "express";
import { User } from "../models/User";
import { AuthedRequest } from "../middleware/auth";

export const me: RequestHandler = async (req: AuthedRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "Not found" });
  const { email, name, picture, timezone } = user;
  res.json({ user: { email, name, picture, timezone, googleConnected: !!user.google?.access_token } });
};
