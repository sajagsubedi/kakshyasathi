import mongoose, { Schema } from "mongoose";
import type { TeacherDoc } from "@/types";

const teacherSchema = new Schema<TeacherDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

const TeacherModel =
  (mongoose.models.Teacher as mongoose.Model<TeacherDoc>) ||
  mongoose.model("Teacher", teacherSchema);

export default TeacherModel;
