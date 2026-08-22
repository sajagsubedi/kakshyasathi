import mongoose, { Schema } from "mongoose";
import type { TeacherPresenceRecordDoc } from "@/types";

const teacherPresenceSchema = new Schema<TeacherPresenceRecordDoc>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    date: { type: Date, required: true },
    periodNumber: { type: Number, required: true },
    entryScanEvent: {
      type: Schema.Types.ObjectId,
      ref: "ScanEvent",
      required: true,
    },
    exitScanEvent: { type: Schema.Types.ObjectId, ref: "ScanEvent" },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date },
  },
  { timestamps: true },
);

teacherPresenceSchema.index({ teacher: 1, date: 1, periodNumber: 1 });
teacherPresenceSchema.index({ classroom: 1, date: 1, periodNumber: 1 });

const TeacherPresenceModel =
  (mongoose.models
    .TeacherPresence as mongoose.Model<TeacherPresenceRecordDoc>) ||
  mongoose.model("TeacherPresence", teacherPresenceSchema);

export default TeacherPresenceModel;
