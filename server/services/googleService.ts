import { google } from "googleapis";
import { IUser } from "../models/User";
import { createOAuthClient } from "../config/google";

export function authClientFromUser(user: IUser) {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({
    access_token: user.google.access_token,
    refresh_token: user.google.refresh_token,
    scope: user.google.scope,
    expiry_date: user.google.expiry_date,
    token_type: user.google.token_type,
  });
  return oauth2Client;
}

export function gmailFor(user: IUser) {
  const auth = authClientFromUser(user);
  return google.gmail({ version: "v1", auth });
}

export function calendarFor(user: IUser) {
  const auth = authClientFromUser(user);
  return google.calendar({ version: "v3", auth });
}
