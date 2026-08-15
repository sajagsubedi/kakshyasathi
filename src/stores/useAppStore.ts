import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
  attendanceDate: string;
  setAttendanceDate: (date: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedSectionId: null,
      setSelectedSectionId: (id) => set({ selectedSectionId: id }),
      attendanceDate: new Date().toISOString().split('T')[0]!,
      setAttendanceDate: (date) => set({ attendanceDate: date }),
    }),
    { name: 'kakshyasathi-app' },
  ),
);
