import mongoose, { Schema } from "mongoose";
import { HolidayDoc, HolidayType } from "@/types";

const holidaySchema = new Schema<HolidayDoc>(
  {
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    date: { type: Date, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(HolidayType),
      default: HolidayType.holiday,
    },
  },
  { timestamps: true },
);

holidaySchema.index({ academicYear: 1, date: 1 }, { unique: true });

const HolidayModel =
  (mongoose.models.Holiday as mongoose.Model<HolidayDoc>) ||
  mongoose.model("Holiday", holidaySchema);

export default HolidayModel;
