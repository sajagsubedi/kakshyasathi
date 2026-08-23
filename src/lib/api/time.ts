const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function parseTime(value: unknown, field: string) {
  if (typeof value !== "string" || !TIME_PATTERN.test(value.trim())) {
    throw new Error(`${field} must be in HH:MM format`);
  }
  return value.trim();
}

export function assertTimeRange(startTime: string, endTime: string) {
  if (startTime >= endTime) {
    throw new Error("Start time must be before end time");
  }
}
