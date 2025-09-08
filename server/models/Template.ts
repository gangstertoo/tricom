import mongoose, { Schema, Types } from "mongoose";

export interface ITemplate {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  subject: string;
  body: string; // markdown
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true },
);

TemplateSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Template =
  (mongoose.models.Template as mongoose.Model<ITemplate>) ||
  mongoose.model<ITemplate>("Template", TemplateSchema);
