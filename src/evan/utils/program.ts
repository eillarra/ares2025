import { toRomanNumeral } from './numbers';

/**
 * Time slot interface for grouping sessions by time
 */
export interface TimeSlot {
  time: string;
  sessions: EvanSession[];
}

/**
 * Session group interface for organizing sessions by day
 */
export interface SessionGroup {
  date: string;
  dateLabel: string;
  sessions: EvanSession[];
}

/**
 * Create time slots by grouping sessions that start at the same time
 * @param sessions - Array of sessions to group
 * @returns Array of time slots sorted by time
 */
export function createTimeSlots(sessions: EvanSession[]): TimeSlot[] {
  const slotsMap = new Map<string, EvanSession[]>();

  sessions.forEach((session) => {
    if (session.start_at) {
      const timeKey = new Date(session.start_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      if (!slotsMap.has(timeKey)) {
        slotsMap.set(timeKey, []);
      }
      slotsMap.get(timeKey)?.push(session);
    }
  });

  return Array.from(slotsMap.entries())
    .map(([time, sessions]) => ({ time, sessions }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Group sessions by date
 * @param sessions - Array of sessions to group
 * @returns Map of date strings to session arrays
 */
export function getSessionsByDate(sessions: EvanSession[]): Map<string, EvanSession[]> {
  const byDate = new Map<string, EvanSession[]>();

  sessions.forEach((session) => {
    if (session.start_at) {
      const dateKey = new Date(session.start_at).toISOString().split('T')[0];
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, []);
      }
      byDate.get(dateKey)?.push(session);
    }
  });

  return byDate;
}

/**
 * Get available dates from sessions
 * @param sessions - Array of sessions
 * @returns Sorted array of date strings
 */
export function getAvailableDates(sessions: EvanSession[]): string[] {
  return Array.from(getSessionsByDate(sessions).keys()).sort();
}

/**
 * Group sessions by day with formatted date labels
 * @param sessions - Array of sessions to group
 * @returns Array of session groups sorted by date
 */
export function groupSessionsByDay(sessions: EvanSession[]): SessionGroup[] {
  const groups = new Map<string, EvanSession[]>();

  sessions.forEach((session) => {
    if (!session.start_at) return;

    const date = new Date(session.start_at).toISOString().split('T')[0];
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)?.push(session);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sessions]) => ({
      date,
      dateLabel: new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      sessions: sessions.sort((a, b) => new Date(a.start_at || '').getTime() - new Date(b.start_at || '').getTime()),
    }));
}

/**
 * Get track name by ID with fallback handling
 * @param tracks - Array of tracks to search
 * @param trackId - The track ID to look up
 * @param fallback - Custom fallback text (default: 'No Track')
 * @returns Track name or fallback text
 */
export function getTrackName(tracks: EvanTrack[], trackId: number | null, fallback = 'No Track'): string {
  if (!trackId) return fallback;
  const track = tracks.find((t) => t.id === trackId);
  return track?.name || 'Unknown track';
}

/**
 * Get room name by ID with fallback handling
 * @param rooms - Array of rooms to search
 * @param roomId - The room ID to look up
 * @param fallback - Custom fallback text (default: 'No Room')
 * @returns Room name or fallback text
 */
export function getRoomName(rooms: EvanRoom[], roomId: number | null, fallback = 'No Room'): string {
  if (!roomId) return fallback;
  const room = rooms.find((r) => r.id === roomId);
  return room?.name || 'Unknown room';
}

/**
 * Filter sessions based on search criteria
 * @param sessions - Array of sessions to filter
 * @param searchQuery - Text to search for in title, description, or track
 * @param selectedDay - Date string to filter by ('all' for no date filter)
 * @param selectedTracks - Array of track IDs to filter by
 * @param tracks - Array of tracks for name lookup in search
 * @returns Filtered array of sessions
 */
export function filterSessions(
  sessions: EvanSession[],
  searchQuery: string,
  selectedDay: string,
  selectedTracks: number[],
  tracks: EvanTrack[],
): EvanSession[] {
  let filtered = sessions;

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (session) =>
        session.title.toLowerCase().includes(query) ||
        session.description.toLowerCase().includes(query) ||
        getTrackName(tracks, session.track).toLowerCase().includes(query),
    );
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
}

/**
 * Create day options for filtering
 * @param availableDates - Array of available date strings
 * @returns Array of option objects with label and value
 */
export function createDayOptions(availableDates: string[]) {
  const options = [{ label: 'All Days', value: 'all' }];

  availableDates.forEach((date) => {
    const dateObj = new Date(date);
    const label = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    options.push({ label, value: date });
  });

  return options;
}

/**
 * Create track options for filtering
 * @param tracks - Array of tracks
 * @returns Array of option objects with label and value
 */
export function createTrackOptions(tracks: EvanTrack[]) {
  return tracks.map((track) => ({
    label: track.name,
    value: track.id,
  }));
}

/**
 * Generate display title for a session
 * @param session - The session object
 * @returns Formatted display title with optional code prefix
 */
export function getSessionDisplayTitle(session: EvanSession): string {
  if (session.code && session.code.trim()) {
    return `${session.code} - ${session.title}`;
  }
  return session.title;
}

/**
 * Generate display title for a subsession
 * @param subsession - The subsession object
 * @param index - Zero-based index of the subsession
 * @param sessionCode - Optional session code for prefixing
 * @returns Formatted display title
 */
export function getSubsessionDisplayTitle(subsession: EvanSubsession, index: number, sessionCode?: string): string {
  const romanNumeral = toRomanNumeral(index + 1);

  if (sessionCode) {
    const baseTitle = `${sessionCode} ${romanNumeral}`;
    if (subsession.title && subsession.title.trim()) {
      return `${baseTitle} - ${subsession.title}`;
    }
    return baseTitle;
  }

  return `${romanNumeral} - ${subsession.title || 'Untitled'}`;
}

/**
 * Format a date string for display
 * @param dateString - The date string to format
 * @param format - 'long' for full format, 'short' for abbreviated format
 * @returns Formatted date string or empty string if invalid
 */
export function formatProgramDate(dateString?: string | null, format: 'long' | 'short' = 'short'): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a time string for display in 24-hour format
 * @param timeString - The time string to format
 * @returns Formatted time string (HH:mm) or empty string if invalid
 */
export function formatProgramTime(timeString?: string | null): string {
  if (!timeString) return '';

  const date = new Date(timeString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Get room display string for program UI
 * Uses getRoomName internally for consistency
 * @param roomId - The room ID
 * @param rooms - Optional array of rooms to look up names from
 * @returns Room display string or 'No room assigned' if no room
 */
export function getProgramRoomDisplay(roomId: number | null, rooms?: EvanRoom[]): string {
  if (!roomId) return 'No room assigned';

  if (rooms) {
    return getRoomName(rooms, roomId, 'No room assigned');
  }

  return `Room ${roomId}`;
}
