import mongoose, { Schema } from "mongoose";
import { LeaveStatus, TeacherLeaveDoc } from "@/types";

const teacherLeaveSchema = new Schema<TeacherLeaveDoc>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(LeaveStatus),
      default: LeaveStatus.pending,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

teacherLeaveSchema.index({ teacher: 1, fromDate: 1, toDate: 1 });

const TeacherLeaveModel =
  (mongoose.models.TeacherLeave as mongoose.Model<TeacherLeaveDoc>) ||
  mongoose.model("TeacherLeave", teacherLeaveSchema);

export default TeacherLeaveModel;
