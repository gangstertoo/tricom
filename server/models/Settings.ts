import mongoose, { Schema, Types } from "mongoose";

export interface ISettings {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  workingHours: { start: string; end: string };
  weekdays: number[]; // 0-6
  locale: string;
  defaultMeetingDurationMins: number;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
    },
    weekdays: { type: [Number], default: [1, 2, 3, 4, 5] },
    locale: { type: String, default: "en-US" },
    defaultMeetingDurationMins: { type: Number, default: 30 },
  },
  { timestamps: true },
);

export const Settings =
  (mongoose.models.Settings as mongoose.Model<ISettings>) ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
