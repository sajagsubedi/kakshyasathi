import mongoose, { Schema } from "mongoose";
import type { ClassDoc } from "@/types";

const classSchema = new Schema<ClassDoc>(
  {
    name: { type: String, required: true, trim: true },
    grade: { type: Number, required: true },
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
  },
  { timestamps: true },
);

classSchema.index({ grade: 1 });

const ClassModel =
  (mongoose.models.Class as mongoose.Model<ClassDoc>) ||
  mongoose.model("Class", classSchema);

export default ClassModel;
