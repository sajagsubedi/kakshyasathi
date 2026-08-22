import mongoose, { Schema } from "mongoose";
import type { AttendanceSessionDoc } from "@/types";

const attendanceSessionSchema = new Schema<AttendanceSessionDoc>(
  {
    section: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    date: { type: Date, required: true },
    periodNumber: { type: Number, required: true },
    effectiveTeacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    effectiveSubject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true },
);

attendanceSessionSchema.index({ classroom: 1, date: 1, periodNumber: 1 });
attendanceSessionSchema.index(
  { section: 1, date: 1, periodNumber: 1 },
  { unique: true },
);

const AttendanceSessionModel =
  (mongoose.models.AttendanceSession as mongoose.Model<AttendanceSessionDoc>) ||
  mongoose.model("AttendanceSession", attendanceSessionSchema);

export default AttendanceSessionModel;
