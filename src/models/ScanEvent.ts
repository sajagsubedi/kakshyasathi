import mongoose, { Schema } from "mongoose";
import type { ScanEventDoc } from "@/types";

const scanEventSchema = new Schema<ScanEventDoc>(
  {
    terminal: {
      type: Schema.Types.ObjectId,
      ref: "AttendanceTerminal",
      required: true,
    },
    cardCode: { type: String, required: true, trim: true },
    scannedAt: { type: Date, required: true }, // DS3231 clock
    receivedAt: { type: Date, required: true }, // Backend clock
    sequenceNumber: { type: Number, required: true },
    personType: { type: String, enum: ["Student", "Teacher"] },
    person: { type: Schema.Types.ObjectId, refPath: "personType" },
    status: {
      type: String,
      enum: ["processed", "duplicate", "invalid"],
      default: "processed",
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
