import mongoose, { Schema, Types } from "mongoose";

export type Priority = "spam" | "neutral" | "urgent";

export interface IEmail {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  gmailId: string;
  threadId: string;
  from: string;
  to: string[];
  subject: string;
  snippet: string;
  bodyHtml?: string;
  bodyText?: string;
  date: Date;
  labels: string[];
  priority: Priority;
  aiSuggestions: string[];
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmailSchema = new Schema<IEmail>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    gmailId: { type: String, required: true, index: true },
    threadId: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: [String], required: true },
    subject: { type: String, required: true },
    snippet: { type: String, default: "" },
    bodyHtml: String,
    bodyText: String,
    date: { type: Date, required: true },
    labels: { type: [String], default: [] },
    priority: {
      type: String,
      enum: ["spam", "neutral", "urgent"],
      index: true,
    },
    aiSuggestions: { type: [String], default: [] },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

EmailSchema.index({ userId: 1, date: -1 });
EmailSchema.index({
  subject: "text",
  snippet: "text",
  bodyText: "text",
  from: "text",
  to: "text",
});

export const Email =
  (mongoose.models.Email as mongoose.Model<IEmail>) ||
  mongoose.model<IEmail>("Email", EmailSchema);
