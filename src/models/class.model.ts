import mongoose, { Document, Schema } from "mongoose";

export interface ClassDoc extends Document {
  name: string;
  grade: number;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<ClassDoc>(
  {
    name: { type: String, required: true, trim: true },
    grade: { type: Number, required: true },
    academicYear: { type: String, required: true },
  },
  { timestamps: true },
);

classSchema.index({ academicYear: 1 });

const ClassModel =
  (mongoose.models.Class as mongoose.Model<ClassDoc>) ||
  mongoose.model("Class", classSchema);

export default ClassModel;
