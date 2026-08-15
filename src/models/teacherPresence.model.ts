import mongoose, { Document, Schema, Types } from "mongoose";

export interface TeacherPresenceDoc extends Document {
  teacherId: Types.ObjectId;
  sectionId: Types.ObjectId;
  date: Date;
  periodId: Types.ObjectId;
  enteredAt: Date;
  exitedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const teacherPresenceSchema = new Schema<TeacherPresenceDoc>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    date: { type: Date, required: true },
    periodId: { type: Schema.Types.ObjectId, ref: "Period", required: true },
    enteredAt: { type: Date, required: true },
    exitedAt: { type: Date },
  },
  { timestamps: true },
);

teacherPresenceSchema.index(
  { teacherId: 1, date: 1, sectionId: 1, periodId: 1 },
  { unique: true },
);

const TeacherPresenceModel =
  (mongoose.models.TeacherPresence as mongoose.Model<TeacherPresenceDoc>) ||
  mongoose.model("TeacherPresence", teacherPresenceSchema);

export default TeacherPresenceModel;
