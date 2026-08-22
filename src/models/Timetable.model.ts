import mongoose, { Schema } from "mongoose";
import { DayOfWeek, type SectionTimetableDoc } from "@/types";

const timetableSchema = new Schema<SectionTimetableDoc>(
  {
    section: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    dayOfWeek: {
      type: String,
      enum: Object.values(DayOfWeek),
      required: true,
    },
    periodNumber: { type: Number, required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    customStartTime: { type: String, trim: true }, // e.g. "12:10"
    customEndTime: { type: String, trim: true }, // e.g. "13:10"
  },
  { timestamps: true },
);

timetableSchema.index(
  { section: 1, dayOfWeek: 1, periodNumber: 1 },
  { unique: true },
);
timetableSchema.index({ classroom: 1, dayOfWeek: 1 });

const TimetableModel =
  (mongoose.models.Timetable as mongoose.Model<SectionTimetableDoc>) ||
  mongoose.model("Timetable", timetableSchema);

export default TimetableModel;
