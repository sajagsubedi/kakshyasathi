import mongoose, { Schema } from "mongoose";
import type { AttendanceRecordDoc } from "@/types";

const studentAttendanceSchema = new Schema<AttendanceRecordDoc>(
  {
    attendanceSession: {
      type: Schema.Types.ObjectId,
      ref: "AttendanceSession",
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    scanEvent: {
      type: Schema.Types.ObjectId,
      ref: "ScanEvent",
      required: true,
    },
    markedAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "late"],
      default: "present",
    },
  },
  { timestamps: true },
);

studentAttendanceSchema.index(
  { attendanceSession: 1, student: 1 },
  { unique: true },
);

const StudentAttendanceModel =
  (mongoose.models.StudentAttendance as mongoose.Model<AttendanceRecordDoc>) ||
  mongoose.model("StudentAttendance", studentAttendanceSchema);

export default StudentAttendanceModel;
