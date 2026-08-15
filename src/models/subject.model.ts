import mongoose, { Document, Schema } from "mongoose";

export interface SubjectDoc extends Document {
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<SubjectDoc>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
  },
  { timestamps: true },
);

const SubjectModel =
  (mongoose.models.Subject as mongoose.Model<SubjectDoc>) ||
  mongoose.model("Subject", subjectSchema);

export default SubjectModel;
