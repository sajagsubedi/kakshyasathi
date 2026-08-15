import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

export enum UserRole {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
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
  email?: string | null;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  emergencyContact?: string;
  admissionDate?: Date;
  rollNumber?: string;
  classId?: Types.ObjectId;
  sectionId?: Types.ObjectId;
  userRole: UserRole;
  password: string;
  isPasswordCorrect: (password: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>(
  {
    profilePicture: {
      url: { type: String, required: false },
      fileId: { type: String, required: false },
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
      lowercase: true,
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
    },
    email: {
      type: String,
      maxlength: 100,
      sparse: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },
    address: {
      type: String,
      maxlength: 500,
    },
    guardianName: {
      type: String,
      maxlength: 100,
    },
    guardianPhone: {
      type: String,
      maxlength: 15,
    },
    emergencyContact: {
      type: String,
      maxlength: 15,
    },
    admissionDate: {
      type: Date,
    },
    rollNumber: {
      type: String,
      maxlength: 20,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
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

userSchema.index({ userRole: 1 });
userSchema.index({ sectionId: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model("User", userSchema);

export default UserModel;
