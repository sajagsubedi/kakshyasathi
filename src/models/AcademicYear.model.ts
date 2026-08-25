import mongoose, { Schema } from "mongoose";
import { AcademicYearDoc, DayOfWeek } from "@/types";

const academicYearSchema = new Schema<AcademicYearDoc>(
  {
    label: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
    weeklyOffDays: {
      type: [String],
      enum: Object.values(DayOfWeek),
      default: [DayOfWeek.sunday],
    },
  },
  { timestamps: true }
);

const AcademicYearModel =
  (mongoose.models.AcademicYear as mongoose.Model<AcademicYearDoc>) ||
  mongoose.model("AcademicYear", academicYearSchema);

export default AcademicYearModel;