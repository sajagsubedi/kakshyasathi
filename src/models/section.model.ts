import mongoose, { Document, Schema, Types } from "mongoose";

export interface SectionDoc extends Document {
  classId: Types.ObjectId;
  name: string;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<SectionDoc>(
  {
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    name: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true },
  },
  { timestamps: true },
);

sectionSchema.index({ classId: 1 });

const SectionModel =
  (mongoose.models.Section as mongoose.Model<SectionDoc>) ||
  mongoose.model("Section", sectionSchema);

export default SectionModel;
