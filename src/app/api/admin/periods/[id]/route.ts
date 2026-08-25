import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import PeriodModel from "@/models/Period.model";
import TimetableModel from "@/models/Timetable.model";
import { parseObjectId } from "@/lib/api/parseId";
import { assertTimeRange, parseTime } from "@/lib/api/time";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const PATCH = withHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const body = await req.json();
    const doc = await PeriodModel.findById(id);
    if (!doc) throw new Error("Period not found");

    if (body.order !== undefined) {
      if (typeof body.order !== "number" || body.order < 1) {
        throw new Error("Invalid order");
      }
      const duplicate = await PeriodModel.findOne({
        academicYear: doc.academicYear,
        order: body.order,
        _id: { $ne: id },
      });
      if (duplicate) throw new Error("Order already exists");
      doc.order = body.order;
    }

    if (body.slotType !== undefined) {
      if (!["period", "break"].includes(body.slotType)) {
        throw new Error("Invalid slot type");
      }
      doc.slotType = body.slotType;
    }

    if (body.periodNumber !== undefined) {
      if (doc.slotType !== "period") {
        throw new Error("Period number can only be set for period slots");
      }
      if (typeof body.periodNumber !== "number" || body.periodNumber < 1) {
        throw new Error("Invalid period number");
      }
      const duplicate = await PeriodModel.findOne({
        academicYear: doc.academicYear,
        periodNumber: body.periodNumber,
        _id: { $ne: id },
      });
      if (duplicate) throw new Error("Period number already exists");
      doc.periodNumber = body.periodNumber;
    }

    if (body.label !== undefined) {
      doc.label = body.label;
    }

    if (body.startTime !== undefined) {
      doc.startTime = parseTime(body.startTime, "Start time");
    }
    if (body.endTime !== undefined) {
      doc.endTime = parseTime(body.endTime, "End time");
    }
    assertTimeRange(doc.startTime, doc.endTime);

    await doc.save();
    return ApiResponse(doc, "Period updated successfully");
  },
);

export const DELETE = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const period = await PeriodModel.findById(id);
    if (!period) throw new Error("Period not found");

    if (period.slotType === "period") {
      const used = await TimetableModel.countDocuments({
        periodNumber: period.periodNumber,
      });
      if (used > 0) {
        throw new Error(
          "Cannot delete a period that is used in section timetables",
        );
      }
    }

    await PeriodModel.findByIdAndDelete(id);
    return ApiResponse(null, "Period deleted successfully");
  },
);
