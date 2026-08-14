import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export enum UserRole {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  CLASS = "CLASS",
  ADMIN = "ADMIN",
}

export interface User extends Document {
  profilePicture?: {
    url: string;
    fileId: string;
  };
  fullName: string;
  username: string;
  phone?: string;
  userRole: UserRole;
  password: string;
  isPasswordCorrect: (password: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>(
  {
    profilePicture: {
      url: {
        type: String,
        required: false,
      },
      fileId: {
        type: String,
        required: false,
      },
    },
    fullName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 50,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 1024,
    },
    phone: {
      type: String,
      maxlength: 15,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please use a valid phone number"],
    },
    userRole: {
      type: String,
      required: true,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (
  password: string,
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model("User", userSchema);

export default UserModel;
