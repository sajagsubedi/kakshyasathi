import mongoose, { Schema } from "mongoose";
import { DeviceStatus, type AttendanceTerminalDoc } from "@/types";

const attendanceTerminalSchema = new Schema<AttendanceTerminalDoc>(
  {
    terminalCode: { type: String, required: true, unique: true, trim: true },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    deviceKey: { type: String, required: true, unique: true, trim: true },
    status: {
      type: String,
      enum: Object.values(DeviceStatus),
      default: DeviceStatus.offline,
    },
    lastSeenAt: { type: Date },
    lastSyncedSequence: { type: Number, default: 0 },
  },
  { timestamps: true },
);

attendanceTerminalSchema.index({ terminalCode: 1 });
attendanceTerminalSchema.index({ deviceKey: 1 });
attendanceTerminalSchema.index({ classroom: 1 });

const AttendanceTerminalModel =
  (mongoose.models
    .AttendanceTerminal as mongoose.Model<AttendanceTerminalDoc>) ||
  mongoose.model("AttendanceTerminal", attendanceTerminalSchema);

export default AttendanceTerminalModel;
