import mongoose, { Schema } from "mongoose";
import type { AcademicYearDoc } from "@/types";

const academicYearSchema = new Schema<AcademicYearDoc>(
  {
    label: { type: String, required: true, unique: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true },
);

academicYearSchema.index({ isActive: 1 });

const AcademicYearModel =
  (mongoose.models.AcademicYear as mongoose.Model<AcademicYearDoc>) ||
  mongoose.model("AcademicYear", academicYearSchema);

export default AcademicYearModel;
