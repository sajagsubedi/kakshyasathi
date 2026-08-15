import mongoose, { Document, Schema, Types } from "mongoose";

export interface TimetableDoc extends Document {
  sectionId: Types.ObjectId;
  dayOfWeek: number;
  periodId: Types.ObjectId;
  subjectId: Types.ObjectId;
  teacherId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const timetableSchema = new Schema<TimetableDoc>(
  {
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    periodId: { type: Schema.Types.ObjectId, ref: "Period", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

timetableSchema.index({ sectionId: 1, dayOfWeek: 1, periodId: 1 }, { unique: true });

const TimetableModel =
  (mongoose.models.Timetable as mongoose.Model<TimetableDoc>) ||
  mongoose.model("Timetable", timetableSchema);

export default TimetableModel;
