import mongoose, { Schema } from "mongoose";
import { PersonType, ScanEventStatus, type ScanEventDoc } from "@/types";

const scanEventSchema = new Schema<ScanEventDoc>(
  {
    terminal: {
      type: Schema.Types.ObjectId,
      ref: "AttendanceTerminal",
      required: true,
    },
    cardCode: { type: String, required: true, trim: true },
    scannedAt: { type: Date, required: true },
    receivedAt: { type: Date, required: true },
    sequenceNumber: { type: Number, required: true },
    personType: { type: String, enum: Object.values(PersonType) },
    person: { type: Schema.Types.ObjectId, refPath: "personType" },
    status: {
      type: String,
      enum: Object.values(ScanEventStatus),
      default: ScanEventStatus.processed,
    },
  },
  { timestamps: true },
);

scanEventSchema.index({ terminal: 1, sequenceNumber: 1 }, { unique: true });
scanEventSchema.index({ cardCode: 1, scannedAt: 1 });

const ScanEventModel =
  (mongoose.models.ScanEvent as mongoose.Model<ScanEventDoc>) ||
  mongoose.model("ScanEvent", scanEventSchema);

export default ScanEventModel;
