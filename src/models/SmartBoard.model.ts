import mongoose, { Schema } from "mongoose";
import { DeviceStatus, type SmartBoardDoc } from "@/types";

const smartBoardSchema = new Schema<SmartBoardDoc>(
  {
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
  },
  { timestamps: true },
);

smartBoardSchema.index({ deviceKey: 1 });
smartBoardSchema.index({ classroom: 1 });

const SmartBoardModel =
  (mongoose.models.SmartBoard as mongoose.Model<SmartBoardDoc>) ||
  mongoose.model("SmartBoard", smartBoardSchema);

export default SmartBoardModel;
