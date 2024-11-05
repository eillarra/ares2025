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
  venues: EvanVenue[];
}
