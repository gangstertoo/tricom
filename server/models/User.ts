import mongoose, { Schema, Types } from "mongoose";

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  scope: string;
  expiry_date: number;
  token_type: string;
}

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  picture?: string;
  google?: GoogleTokens;
  passwordHash?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoogleSchema = new Schema<GoogleTokens>({
  access_token: { type: String, required: true },
  refresh_token: { type: String, required: true },
  scope: { type: String, required: true },
  expiry_date: { type: Number, required: true },
  token_type: { type: String, required: true },
});

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    picture: { type: String },
    passwordHash: { type: String },
    google: { type: GoogleSchema, required: false },
    timezone: { type: String, default: "UTC" },
  },
  { timestamps: true },
);

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
