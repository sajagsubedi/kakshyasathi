import mongoose, { Schema } from "mongoose";
import type { GlobalTimetableDoc } from "@/types";

const periodSchema = new Schema<GlobalTimetableDoc>(
  {
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    periodNumber: { type: Number, required: true },
    startTime: { type: String, required: true, trim: true }, // "10:15"
    endTime: { type: String, required: true, trim: true }, // "11:00"
  },
  { timestamps: true },
);

periodSchema.index({ academicYear: 1, periodNumber: 1 }, { unique: true });

const PeriodModel =
  (mongoose.models.Period as mongoose.Model<GlobalTimetableDoc>) ||
  mongoose.model("Period", periodSchema);

export default PeriodModel;
