import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import UserModel from "@/models/User.model";
import StudentModel from "@/models/Student.model";
import TeacherModel from "@/models/Teacher.model";
import TimetableModel from "@/models/Timetable.model";
import SubstitutionModel from "@/models/Substitution.model";
import { parseObjectId } from "@/lib/api/parseId";
import { PersonGender, UserRole } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function loadUserBundle(id: string) {
  const user = await UserModel.findById(id).select("-password").lean();
  if (!user) throw new Error("User not found");

  const [student, teacher] = await Promise.all([
    StudentModel.findOne({ user: id })
      .populate({
        path: "section",
        populate: { path: "class", select: "name grade" },
      })
      .lean(),
    TeacherModel.findOne({ user: id }).lean(),
  ]);

  return { ...user, student, teacher };
}

export const GET = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);
    return ApiResponse(await loadUserBundle(id), "User fetched successfully");
  },
);

export const PATCH = withHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const body = await req.json();
    const user = await UserModel.findById(id);
    if (!user) throw new Error("User not found");

    if (body.name !== undefined) {
      if (!body.name.trim()) throw new Error("Name cannot be empty");
      user.name = body.name.trim();
    }
    if (body.username !== undefined) {
      const username = body.username.trim().toLowerCase();
      if (!username) throw new Error("Username cannot be empty");
      const duplicate = await UserModel.findOne({
        username,
        _id: { $ne: id },
      });
      if (duplicate) throw new Error("Username already exists");
      user.username = username;
    }
    if (body.email !== undefined) {
      const email = body.email.trim().toLowerCase();
      if (!email) throw new Error("Email cannot be empty");
      const duplicate = await UserModel.findOne({ email, _id: { $ne: id } });
      if (duplicate) throw new Error("Email already exists");
      user.email = email;
    }
    if (body.gender !== undefined) {
      if (!Object.values(PersonGender).includes(body.gender)) {
        throw new Error("Invalid gender");
      }
      user.gender = body.gender;
    }
    if (body.password) {
      if (String(body.password).length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      user.password = body.password;
    }

    await user.save();

    if (user.role === UserRole.student) {
      const student = await StudentModel.findOne({ user: id });
      if (student) {
        if (body.section !== undefined) {
          parseObjectId(body.section, "section");
          student.section = body.section;
        }
        if (body.rollNumber !== undefined) {
          if (!body.rollNumber.trim()) throw new Error("Roll number cannot be empty");
          student.rollNumber = body.rollNumber.trim();
        }
        if (body.symbolNumber !== undefined) {
          if (!body.symbolNumber.trim()) {
            throw new Error("Symbol number cannot be empty");
          }
          student.symbolNumber = body.symbolNumber.trim();
        }
        if (body.enrollmentYear !== undefined) {
          if (!body.enrollmentYear.trim()) {
            throw new Error("Enrollment year cannot be empty");
          }
          student.enrollmentYear = body.enrollmentYear.trim();
        }
        if (body.guardianContact !== undefined) {
          student.guardianContact = body.guardianContact.trim() || undefined;
        }
        await student.save();
      }
    }

    return ApiResponse(await loadUserBundle(id), "User updated successfully");
  },
);

export const DELETE = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    const session = await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    if (session.user._id === id) {
      throw new Error("You cannot delete your own account");
    }

    const user = await UserModel.findById(id);
    if (!user) throw new Error("User not found");

    if (user.role === UserRole.admin) {
      const adminCount = await UserModel.countDocuments({ role: UserRole.admin });
      if (adminCount <= 1) {
        throw new Error("Cannot delete the last admin");
      }
    }

    if (user.role === UserRole.teacher) {
      const teacher = await TeacherModel.findOne({ user: id });
      if (teacher) {
        const [ttCount, subCount] = await Promise.all([
          TimetableModel.countDocuments({ teacher: teacher._id }),
          SubstitutionModel.countDocuments({
            $or: [
              { originalTeacher: teacher._id },
              { substituteTeacher: teacher._id },
            ],
          }),
        ]);
        if (ttCount > 0 || subCount > 0) {
          throw new Error(
            "Cannot delete teacher who is assigned in timetable or substitutions",
          );
        }
        await TeacherModel.findByIdAndDelete(teacher._id);
      }
    }

    if (user.role === UserRole.student) {
      await StudentModel.findOneAndDelete({ user: id });
    }

    await UserModel.findByIdAndDelete(id);
    return ApiResponse(null, "User deleted successfully");
  },
);
