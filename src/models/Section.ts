import mongoose, { Schema } from "mongoose";
import type { SectionDoc } from "@/types";

const sectionSchema = new Schema<SectionDoc>(
  {
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

sectionSchema.index({ class: 1 });

const SectionModel =
  (mongoose.models.Section as mongoose.Model<SectionDoc>) ||
  mongoose.model("Section", sectionSchema);

export default SectionModel;
