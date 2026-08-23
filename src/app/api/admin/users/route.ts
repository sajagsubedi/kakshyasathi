import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import UserModel from "@/models/User.model";
import StudentModel from "@/models/Student.model";
import TeacherModel from "@/models/Teacher.model";
import SectionModel from "@/models/Section.model";
import { getPagination } from "@/lib/api/pagination";
import { parseObjectId } from "@/lib/api/parseId";
import { PersonGender, UserRole } from "@/types";

function attachProfiles(
  users: Array<{ _id: unknown; role: UserRole }>,
  students: unknown[],
  teachers: unknown[],
) {
  const studentsByUser = new Map(
    (students as Array<{ user: { toString(): string } | string }>).map(
      (student) => [
        typeof student.user === "string"
          ? student.user
          : student.user.toString(),
        student,
      ],
    ),
  );
  const teachersByUser = new Map(
    (teachers as Array<{ user: { toString(): string } | string }>).map(
      (teacher) => [
        typeof teacher.user === "string"
          ? teacher.user
          : teacher.user.toString(),
        teacher,
      ],
    ),
  );

  return users.map((user) => {
    const id = String(user._id);
    return {
      ...user,
      student: studentsByUser.get(id) ?? null,
      teacher: teachersByUser.get(id) ?? null,
    };
  });
}

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const { searchParams } = new URL(req.url);
  const { page, limit, skip } = getPagination(searchParams);
  const search = searchParams.get("search");
  const role = searchParams.get("role");

  const filter: Record<string, unknown> = {};
  if (role && Object.values(UserRole).includes(role as UserRole)) {
    filter.role = role;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select("-password")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  const ids = users.map((user) => user._id);

  const [students, teachers] = await Promise.all([
    StudentModel.find({ user: { $in: ids } })
      .populate({
        path: "section",
        populate: { path: "class", select: "name grade" },
      })
      .lean(),
    TeacherModel.find({ user: { $in: ids } }).lean(),
  ]);

  return ApiResponse(
    {
      items: attachProfiles(users, students, teachers),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    "Users fetched successfully",
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();
  const {
    role,
    name,
    username,
    email,
    password,
    gender,
    section,
    rollNumber,
    symbolNumber,
    enrollmentYear,
    guardianContact,
  } = body;

  if (!role || !Object.values(UserRole).includes(role)) {
    throw new Error("Valid role is required");
  }
  if (!name?.trim()) throw new Error("Name is required");
  if (!username?.trim()) throw new Error("Username is required");
  if (!email?.trim()) throw new Error("Email is required");
  if (!password || String(password).length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (!gender || !Object.values(PersonGender).includes(gender)) {
    throw new Error("Valid gender is required");
  }

  const user = await UserModel.create({
    role,
    name: name.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password,
    gender,
  });

  try {
    if (role === UserRole.student) {
      if (!section) throw new Error("Section is required for students");
      if (!rollNumber?.trim()) throw new Error("Roll number is required");
      if (!symbolNumber?.trim()) throw new Error("Symbol number is required");
      if (!enrollmentYear?.trim()) {
        throw new Error("Enrollment year is required");
      }
      parseObjectId(section, "section");
      const sectionExists = await SectionModel.findById(section);
      if (!sectionExists) throw new Error("Section not found");

      await StudentModel.create({
        user: user._id,
        section,
        rollNumber: rollNumber.trim(),
        symbolNumber: symbolNumber.trim(),
        enrollmentYear: enrollmentYear.trim(),
        guardianContact: guardianContact?.trim() || undefined,
      });
    }

    if (role === UserRole.teacher) {
      await TeacherModel.create({
        user: user._id,
      });
    }
  } catch (error) {
    await UserModel.findByIdAndDelete(user._id);
    console.log(error);
    throw error;
  }

  const created = await UserModel.findById(user._id).select("-password").lean();
  return ApiResponse(created, "User created successfully", 201);
});
