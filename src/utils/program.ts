// Re-export types
export type { TimeSlot, SessionGroup } from 'src/evan/utils/program';

// Re-export all generic program utilities from evan utils
export {
  createTimeSlots,
  getSessionsByDate,
  getAvailableDates,
  groupSessionsByDay,
  getTrackName,
  getRoomName,
  filterSessions,
  createDayOptions,
  createTrackOptions,
  getSessionDisplayTitle,
  getSubsessionDisplayTitle,
  formatProgramDate,
  formatProgramTime,
  getProgramRoomDisplay,
} from 'src/evan/utils/program';

// ARES 2025 specific utilities can be added here if needed
