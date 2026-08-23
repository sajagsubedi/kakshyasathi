import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest } from "@/hooks/admin/http";
import { DeviceStatus, NoticeTargetType } from "@/types";

export interface DashboardData {
  counts: {
    students: number;
    teachers: number;
    admins: number;
    classes: number;
    sections: number;
    subjects: number;
    classrooms: number;
    smartBoards: number;
    terminals: number;
    notices: number;
    substitutionsToday: number;
    attendanceToday: number;
  };
  smartBoardStatus: Record<DeviceStatus, number>;
  terminalStatus: Record<DeviceStatus, number>;
  recentNotices: Array<{
    _id: string;
    title: string;
    body: string;
    publishedAt: string;
    author?: { name: string };
    targetType?: NoticeTargetType;
    targetSections?: Array<unknown>;
  }>;
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      return adminRequest<DashboardData>(
        axios.get("/api/admin/dashboard"),
        "Failed to load dashboard.",
      );
    },
  });
}
