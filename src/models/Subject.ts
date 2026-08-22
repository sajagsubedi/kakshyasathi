import mongoose, { Schema } from "mongoose";
import type { SubjectDoc } from "@/types";

const subjectSchema = new Schema<SubjectDoc>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true },
);

const SubjectModel =
  (mongoose.models.Subject as mongoose.Model<SubjectDoc>) ||
  mongoose.model("Subject", subjectSchema);

export default SubjectModel;
