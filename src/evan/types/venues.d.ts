interface EvanVenueRoom {
  name: string;
}

interface EvanVenue {
  is_main: boolean;
  name: string;
  presentation: MarkdownText | EmptyString;
  rooms: EvanVenueRoom[];
  gmaps: Url | EmptyString;
}
