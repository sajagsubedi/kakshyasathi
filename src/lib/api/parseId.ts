import { Types } from "mongoose";

export function parseObjectId(id: string, name = "id"): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${name}`);
  }
  return new Types.ObjectId(id);
}
