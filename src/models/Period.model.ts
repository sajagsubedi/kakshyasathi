import mongoose, { Schema } from "mongoose";
import type { GlobalTimetableDoc } from "@/types";
import { SlotType } from "@/types";

const periodSchema = new Schema<GlobalTimetableDoc>(
  {
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    order: { type: Number, required: true },
    slotType: {
      type: String,
      enum: Object.values(SlotType),
      required: true,
    },
    periodNumber: {
      type: Number,
      required: function (this: GlobalTimetableDoc) {
        return this.slotType === SlotType.period;
      },
    },
    label: { type: String, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

periodSchema.index({ academicYear: 1, order: 1 }, { unique: true });

periodSchema.index(
  { academicYear: 1, periodNumber: 1 },
  { unique: true, partialFilterExpression: { slotType: SlotType.period } },
);

const PeriodModel =
  (mongoose.models.Period as mongoose.Model<GlobalTimetableDoc>) ||
  mongoose.model("Period", periodSchema);

export default PeriodModel;
