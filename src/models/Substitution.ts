import mongoose, { Schema } from "mongoose";
import type { SubstitutionDoc } from "@/types";

const substitutionSchema = new Schema<SubstitutionDoc>(
  {
    section: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    periodNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    originalTeacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    substituteTeacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
  },
  { timestamps: true },
);

substitutionSchema.index(
  { section: 1, date: 1, periodNumber: 1 },
  { unique: true },
);

const SubstitutionModel =
  (mongoose.models.Substitution as mongoose.Model<SubstitutionDoc>) ||
  mongoose.model("Substitution", substitutionSchema);

export default SubstitutionModel;
