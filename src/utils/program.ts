// Re-export types from evan-kit
export type { TimeSlot, SessionGroup, EvanSession, EvanRoom, EvanSubsession } from '@evan/utils/program';

// Re-export all generic program utilities from evan-kit
export {
  createTimeSlots,
  getSessionsByDate,
  groupSessionsByDay,
  groupSessionsByDayAdvanced,
  getTrackName,
  getRoomName,
  filterSessions,
  createTrackOptions,
  getSessionDisplayTitle,
  getSubsessionDisplayTitle,
  sortKeynotes,
  sortSessionsAdvanced,
  getKeynoteAvatar,
} from '@evan/utils/program';

// Import utilities for our ARES-specific functions
import {
  formatProgramDate as _formatProgramDate,
  formatProgramTime as _formatProgramTime,
  createDayOptions as _createDayOptions,
  getAvailableDays as _getAvailableDays,
  getRoomName,
  getSubsessionDisplayTitle,
} from '@evan/utils/program';

import type { EvanSession, EvanRoom, EvanSubsession } from '@evan/types';

import { EVAN_EVENT_TIMEZONE, EVAN_EVENT_IS_VIRTUAL } from '@/constants';

// ARES-specific timezone-aware formatting functions
export const formatProgramDate = (dateString?: string | null, format: 'long' | 'short' = 'short'): string => {
  return _formatProgramDate(dateString, format, EVAN_EVENT_TIMEZONE, EVAN_EVENT_IS_VIRTUAL);
};

export const formatProgramTime = (timeString?: string | null): string => {
  return _formatProgramTime(timeString, EVAN_EVENT_TIMEZONE, EVAN_EVENT_IS_VIRTUAL);
};

export const createDayOptions = (availableDates: string[]) => {
  return _createDayOptions(availableDates, EVAN_EVENT_TIMEZONE, EVAN_EVENT_IS_VIRTUAL);
};

export const getAvailableDays = (sessions: EvanSession[]) => {
  return _getAvailableDays(sessions, EVAN_EVENT_TIMEZONE, EVAN_EVENT_IS_VIRTUAL, 'weekday-only');
};

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
