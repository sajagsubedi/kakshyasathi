import mongoose, { Schema } from "mongoose";
import type { UserDoc } from "@/types";
import bcrypt from "bcryptjs";

const userSchema = new Schema<UserDoc>(
  {
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, username: 1 });

// userSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = bcrypt.hash(this.password, 10);
// });

userSchema.methods.isPasswordCorrect = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const UserModel =
  (mongoose.models.User as mongoose.Model<UserDoc>) ||
  mongoose.model("User", userSchema);

export default UserModel;
