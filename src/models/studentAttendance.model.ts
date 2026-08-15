import mongoose, { Document, Schema, Types } from "mongoose";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface StudentAttendanceDoc extends Document {
  studentId: Types.ObjectId;
  sectionId: Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  scannedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studentAttendanceSchema = new Schema<StudentAttendanceDoc>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LATE"],
      required: true,
    },
    scannedAt: { type: Date },
  },
  { timestamps: true },
);

studentAttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
studentAttendanceSchema.index({ sectionId: 1, date: 1 });

const StudentAttendanceModel =
  (mongoose.models.StudentAttendance as mongoose.Model<StudentAttendanceDoc>) ||
  mongoose.model("StudentAttendance", studentAttendanceSchema);

export default StudentAttendanceModel;
