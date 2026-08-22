import mongoose, { Schema } from "mongoose";
import type { ClassroomDoc } from "@/types";

const classroomSchema = new Schema<ClassroomDoc>(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    section: { type: Schema.Types.ObjectId, ref: "Section", required: true },
  },
  { timestamps: true },
);

const ClassroomModel =
  (mongoose.models.Classroom as mongoose.Model<ClassroomDoc>) ||
  mongoose.model("Classroom", classroomSchema);

export default ClassroomModel;
