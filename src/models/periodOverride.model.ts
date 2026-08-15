import mongoose, { Document, Schema, Types } from "mongoose";

export interface PeriodOverrideDoc extends Document {
  sectionId: Types.ObjectId;
  date: Date;
  periodId: Types.ObjectId;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const periodOverrideSchema = new Schema<PeriodOverrideDoc>(
  {
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    date: { type: Date, required: true },
    periodId: { type: Schema.Types.ObjectId, ref: "Period", required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true },
);

periodOverrideSchema.index({ sectionId: 1, date: 1, periodId: 1 }, { unique: true });

const PeriodOverrideModel =
  (mongoose.models.PeriodOverride as mongoose.Model<PeriodOverrideDoc>) ||
  mongoose.model("PeriodOverride", periodOverrideSchema);

export default PeriodOverrideModel;
