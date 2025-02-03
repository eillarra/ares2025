interface EvanTrack {
  id: number;
  name: string;
  position: number;
}

interface EvanEvent {
  code: string;
  name: string;
  full_name: string;
  presentation: MarkdownText | EmptyString;
  hashtag: string | EmptyString;
  email: string | EmptyString;
  city: string;
  country: EvanCountry;
  start_date: string;
  end_date: string;
  registration_start_date: string;
  registration_deadline: string;
  registration_url: Url;
  sessions: EvanSession[];
  tracks: EvanTrack[];
  venues: EvanVenue[];
  extra_data: {
    important_dates: ImportantDate[];
  };
}
