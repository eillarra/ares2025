// Re-export types from evan-kit
export type { TimeSlot, SessionGroup, EvanSession, EvanRoom, EvanSubsession } from '@evan/utils/program';

// Re-export all generic program utilities from evan-kit
export {
  createTimeSlots,
  getSessionsByDate,
  groupSessionsByDay,
  groupSessionsByDayAdvanced,
  getTrackName,
  getTopicName,
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
  getTrackName,
  getTopicName,
} from '@evan/utils/program';

import type { EvanSession, EvanRoom, EvanSubsession, EvanTrack, EvanKeynote } from '@evan/types';

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

// Enhanced session filtering with session type support
export const filterSessionsWithTypes = (
  sessions: EvanSession[],
  searchQuery: string,
  selectedDay: string,
  selectedTracks: number[],
  tracks: EvanTrack[],
  keynotes: EvanKeynote[] = [],
  topics: EvanTopic[] = [],
): EvanSession[] => {
  let filtered = sessions;

  if (searchQuery) {
    const query = searchQuery.toLowerCase();

    filtered = filtered.filter((session) => {
      // Get session type
      const sessionType = getSessionType(session, tracks);

      // Check if this session has any keynotes associated with it
      const hasKeynote = keynotes.some((keynote) => keynote.session === session.id);

      // Search in multiple fields including session type and topics
      const searchFields = [
        session.code,
        session.title,
        getTrackName(tracks, session.track),
        sessionType, // Add session type to search
        // Add topic names as searchable terms
        ...session.topics.map((topicId) => getTopicName(topics, topicId)),
      ];

      // If this session has a keynote, also add "keynote" as a searchable term
      if (hasKeynote) {
        searchFields.push('keynote');
        // Add all keynote speakers for this session to search fields
        const sessionKeynotes = keynotes.filter((keynote) => keynote.session === session.id);
        sessionKeynotes.forEach((keynote) => {
          if (keynote.speaker) {
            searchFields.push(keynote.speaker);
          }
        });
      }

      // Add keynote speaker name if it's a keynote (this covers main keynotes)
      if (sessionType === 'keynote') {
        const keynote = keynotes.find((k) => k.session === session.id);
        if (keynote?.speaker) {
          searchFields.push(keynote.speaker);
        }
      }

      return searchFields.some((field) => field && field.toLowerCase().includes(query));
    });
  }

  if (selectedDay !== 'all') {
    filtered = filtered.filter((session) => {
      if (!session.start_at) return false;
      const sessionDate = new Date(session.start_at).toISOString().split('T')[0];
      return sessionDate === selectedDay;
    });
  }

  if (selectedTracks.length > 0) {
    filtered = filtered.filter((session) => session.track && selectedTracks.includes(session.track));
  }

  return filtered;
};

// Helper function to determine session type
export const getSessionType = (session: EvanSession, tracks: EvanTrack[]): string => {
  if (session.is_social_event) return 'social event';
  if (!session.track) return 'session';

  const track = tracks.find((t) => t.id === session.track);
  if (!track) return 'session';

  const trackName = track.name.toLowerCase();
  if (trackName.includes('keynote')) return 'keynote';
  if (trackName.includes('paper')) return 'paper';
  return 'session';
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
