import mongoose, { Schema } from "mongoose";
import type { TeacherDoc } from "@/types";

const teacherSchema = new Schema<TeacherDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
    assignedSections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
  },
  { timestamps: true },
);

const TeacherModel =
  (mongoose.models.Teacher as mongoose.Model<TeacherDoc>) ||
  mongoose.model("Teacher", teacherSchema);

export default TeacherModel;
