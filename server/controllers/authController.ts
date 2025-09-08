import { RequestHandler } from "express";
import { createOAuthClient, GOOGLE_SCOPES } from "../config/google";
import { env } from "../config/env";
import { google } from "googleapis";
import { User } from "../models/User";
import jwt from "jsonwebtoken";

export const startGoogleAuth: RequestHandler = async (_req, res) => {
  const oauth2Client = createOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
  });
  res.json({ url });
};

export const googleCallback: RequestHandler = async (req, res, next) => {
  try {
    const code = req.query.code as string;
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const me = await oauth2.userinfo.get();
    const profile = me.data;

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = new User({
        email: profile.email!,
        name: profile.name || profile.email!,
        picture: profile.picture,
        google: {
          access_token: tokens.access_token!,
          refresh_token: tokens.refresh_token!,
          scope: tokens.scope!,
          expiry_date: tokens.expiry_date!,
          token_type: tokens.token_type!,
        },
      } as any);
    } else {
      user.google = {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token || user.google.refresh_token,
        scope: tokens.scope || user.google.scope,
        expiry_date: tokens.expiry_date || user.google.expiry_date,
        token_type: tokens.token_type || user.google.token_type,
      } as any;
      user.name = profile.name || user.name;
      user.picture = profile.picture || user.picture;
    }
    await user.save();

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    const redirect = `${env.CLIENT_URL}/auth/callback?token=${encodeURIComponent(token)}`;
    res.redirect(302, redirect);
  } catch (e) {
    next(e);
  }
};
