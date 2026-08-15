import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

export type SmartBoardStatus = "ONLINE" | "OFFLINE";

export interface SmartBoardDoc extends Document {
  deviceId: string;
  name: string;
  sectionId: Types.ObjectId;
  password: string;
  status: SmartBoardStatus;
  lastSeenAt?: Date;
  isPasswordCorrect: (password: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const smartBoardSchema = new Schema<SmartBoardDoc>(
  {
    deviceId: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    password: { type: String, required: true, minlength: 8 },
    status: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      default: "OFFLINE",
    },
    lastSeenAt: { type: Date },
  },
  { timestamps: true },
);

smartBoardSchema.index({ deviceId: 1 });
smartBoardSchema.index({ sectionId: 1 });

smartBoardSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

smartBoardSchema.methods.isPasswordCorrect = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const SmartBoardModel =
  (mongoose.models.SmartBoard as mongoose.Model<SmartBoardDoc>) ||
  mongoose.model("SmartBoard", smartBoardSchema);

export default SmartBoardModel;
