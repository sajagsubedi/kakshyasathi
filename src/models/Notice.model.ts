import mongoose, { Schema } from "mongoose";
import { NoticeTargetType, type NoticeDoc } from "@/types";

const noticeSchema = new Schema<NoticeDoc>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: {
      type: String,
      enum: Object.values(NoticeTargetType),
      required: true,
    },
    targetSections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
    publishedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

noticeSchema.index({ targetType: 1, publishedAt: -1 });
noticeSchema.index({ targetSections: 1, publishedAt: -1 });

const NoticeModel =
  (mongoose.models.Notice as mongoose.Model<NoticeDoc>) ||
  mongoose.model("Notice", noticeSchema);

export default NoticeModel;
