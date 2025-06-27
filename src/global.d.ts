// Global type declarations for ARES 2025
// This makes all evan-kit types globally available without imports

import type * as EvanTypes from '@evan/types';

declare global {
  // Re-export all evan-kit types as global types
  type ApiEndpoint = EvanTypes.ApiEndpoint;
  type Url = EvanTypes.Url;
  type MarkdownText = EvanTypes.MarkdownText;
  type EmptyString = EvanTypes.EmptyString;
  type EvanCountry = EvanTypes.EvanCountry;

  type ImportantDate = EvanTypes.ImportantDate;
  type Person = EvanTypes.Person;
  type Committee = EvanTypes.Committee;

  type EvanEvent = EvanTypes.EvanEvent;
  type EvanFee = EvanTypes.EvanFee;

  type EvanSession = EvanTypes.EvanSession;
  type EvanSubsession = EvanTypes.EvanSubsession;
  type EvanPaper = EvanTypes.EvanPaper;
  type EvanKeynote = EvanTypes.EvanKeynote;
  type EvanTrack = EvanTypes.EvanTrack;

  type EvanVenue = EvanTypes.EvanVenue;
  type EvanVenueRoom = EvanTypes.EvanVenueRoom;
  type EvanRoom = EvanTypes.EvanRoom;

  type EvanFile = EvanTypes.EvanFile;
  type EvanContent = EvanTypes.EvanContent;
}

export {};
