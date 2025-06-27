// Re-export types
export type { TimeSlot, SessionGroup } from '@evan/utils/program';

// Re-export all generic program utilities from evan utils
export {
  createTimeSlots,
  getSessionsByDate,
  getAvailableDates,
  groupSessionsByDay,
  groupSessionsByDayAdvanced,
  getTrackName,
  getRoomName,
  filterSessions,
  createDayOptions,
  createTrackOptions,
  getSessionDisplayTitle,
  getSubsessionDisplayTitle,
  formatProgramDate,
  formatProgramTime,
  sortKeynotes,
  sortSessionsAdvanced,
} from '@evan/utils/program';

// Import utilities for our new functions
import { formatProgramDate, formatProgramTime, getRoomName, getSubsessionDisplayTitle } from '@evan/utils/program';

// Session display utilities for details dialogs
export interface SessionDisplayInfo {
  title: string;
  timeInfo: string | null;
  roomInfo: string | null;
}

// ARES 2025 specific utilities can be added here if needed

const KEYNOTES_TRACK = 53; // Track ID for keynotes, used in ARES 2025

export const createSessionDisplayInfo = (session: EvanSession, rooms: EvanRoom[] = []): SessionDisplayInfo => {
  const startTime = session.start_at ? formatProgramTime(session.start_at) : null;
  const endTime = session.end_at ? formatProgramTime(session.end_at) : null;
  const date = session.start_at ? formatProgramDate(session.start_at) : null;

  let timeInfo = '';
  if (date) {
    timeInfo = date;
    if (startTime) {
      timeInfo += ` at ${startTime}`;
      if (endTime) {
        timeInfo += ` - ${endTime}`;
      }
    }
  }

  return {
    title: `${session.code && session.track !== KEYNOTES_TRACK ? session.code + ' - ' : ''}${session.title}`,
    timeInfo: timeInfo || null,
    roomInfo: session.room ? getRoomName(rooms || [], session.room) : null,
  };
};

export const createSubsessionDisplayInfo = (
  subsession: EvanSubsession,
  subsessionIndex: number,
  sessionCode: string | null,
  sessionRoom: number | null,
  rooms: EvanRoom[] = [],
): SessionDisplayInfo => {
  const displayTitle = getSubsessionDisplayTitle(subsession, subsessionIndex, sessionCode);

  return {
    title: displayTitle,
    timeInfo:
      subsession.start_at && subsession.end_at
        ? `${formatProgramDate(subsession.start_at)}, ${formatProgramTime(subsession.start_at)} - ${formatProgramTime(subsession.end_at)}`
        : null,
    roomInfo: sessionRoom ? getRoomName(rooms || [], sessionRoom) : null,
  };
};
