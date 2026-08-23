import mongoose, { Schema } from "mongoose";
import type { StudentDoc } from "@/types";

const studentSchema = new Schema<StudentDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    section: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    rollNumber: { type: String, required: true, trim: true },
    symbolNumber: { type: String, required: true, unique: true, trim: true },
    enrollmentYear: { type: String, required: true },
    guardianContact: { type: String, trim: true },
  },
  { timestamps: true },
);

studentSchema.index({ section: 1 });

const StudentModel =
  (mongoose.models.Student as mongoose.Model<StudentDoc>) ||
  mongoose.model("Student", studentSchema);

export default StudentModel;
