export function refId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "_id" in value) {
    return String((value as { _id: string })._id);
  }
  return "";
}

export function sectionLabel(section: unknown): string {
  if (!section || typeof section === "string") return "Unknown section";
  const value = section as {
    name?: string;
    class?: { name?: string };
  };
  if (value.class?.name && value.name) {
    return `${value.class.name} - ${value.name}`;
  }
  return value.name || "Unknown section";
}

export function teacherName(teacher: unknown): string {
  if (!teacher || typeof teacher === "string") return "Teacher";
  const value = teacher as { user?: { name?: string } };
  return value.user?.name || "Teacher";
}

export function classroomLabel(classroom: unknown): string {
  if (!classroom || typeof classroom === "string") return "Classroom";
  const value = classroom as { roomNumber?: string };
  return value.roomNumber ? `Room ${value.roomNumber}` : "Classroom";
}
