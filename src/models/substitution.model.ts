import mongoose, { Document, Schema, Types } from "mongoose";

export interface SubstitutionDoc extends Document {
  sectionId: Types.ObjectId;
  date: Date;
  periodId: Types.ObjectId;
  regularTeacherId: Types.ObjectId;
  substituteTeacherId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const substitutionSchema = new Schema<SubstitutionDoc>(
  {
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    date: { type: Date, required: true },
    periodId: { type: Schema.Types.ObjectId, ref: "Period", required: true },
    regularTeacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    substituteTeacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

substitutionSchema.index({ sectionId: 1, date: 1, periodId: 1 }, { unique: true });

const SubstitutionModel =
  (mongoose.models.Substitution as mongoose.Model<SubstitutionDoc>) ||
  mongoose.model("Substitution", substitutionSchema);

export default SubstitutionModel;
