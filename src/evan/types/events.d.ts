interface EvanFeeConfig {
  included_social_events: number[];
}

interface EvanFee {
  type: string;
  notes: string;
  early_value: number;
  value: number;
  config: EvanFeeConfig;
}

interface EvanTrack {
  readonly id: number;
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
  is_open_for_registration: boolean;
  registration_start_date: string;
  registration_early_deadline: string;
  registration_deadline: string;
  registration_url: Url;
  fees: EvanFee[];
  sessions: EvanSession[];
  tracks: EvanTrack[];
  venues: EvanVenue[];
  extra_data: {
    important_dates: ImportantDate[];
  };
}
