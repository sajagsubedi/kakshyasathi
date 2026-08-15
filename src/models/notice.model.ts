import mongoose, { Document, Schema, Types } from "mongoose";

export type NoticeTargetType = "ALL" | "SELECTED_SECTIONS";
export type NoticePriority = "LOW" | "MEDIUM" | "HIGH";
export type NoticeStatus = "ACTIVE" | "EXPIRED" | "DRAFT";

export interface NoticeDoc extends Document {
  title: string;
  content: string;
  createdBy: Types.ObjectId;
  targetType: NoticeTargetType;
  targetSections: Types.ObjectId[];
  priority: NoticePriority;
  expiresAt?: Date;
  status: NoticeStatus;
  createdAt: Date;
  updatedAt: Date;
}

const noticeSchema = new Schema<NoticeDoc>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: {
      type: String,
      enum: ["ALL", "SELECTED_SECTIONS"],
      required: true,
    },
    targetSections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    expiresAt: { type: Date },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "DRAFT"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

const NoticeModel =
  (mongoose.models.Notice as mongoose.Model<NoticeDoc>) ||
  mongoose.model("Notice", noticeSchema);

export default NoticeModel;
