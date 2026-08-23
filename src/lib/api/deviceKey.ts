import { randomBytes } from "crypto";

export function generateDeviceKey() {
  return randomBytes(24).toString("hex");
}
