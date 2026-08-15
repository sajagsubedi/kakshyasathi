import mongoose, { Document, Schema } from "mongoose";

export interface PeriodDoc extends Document {
  periodNumber: number;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const periodSchema = new Schema<PeriodDoc>(
  {
    periodNumber: { type: Number, required: true, unique: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true },
);

const PeriodModel =
  (mongoose.models.Period as mongoose.Model<PeriodDoc>) ||
  mongoose.model("Period", periodSchema);

export default PeriodModel;
