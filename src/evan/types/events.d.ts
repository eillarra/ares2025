interface EvanFee {
  readonly type: string;
  readonly notes: string;
  readonly early_value: number;
  readonly value: number;
  readonly config: {
    included_social_events: number[];
  };
}

interface EvanTrack {
  readonly id: number;
  readonly name: string;
  readonly position: number;
}

interface EvanEvent {
  readonly code: string;
  readonly name: string;
  readonly full_name: string;
  readonly presentation: MarkdownText | EmptyString;
  readonly hashtag: string | EmptyString;
  readonly email: string | EmptyString;
  readonly city: string;
  readonly country: EvanCountry;
  readonly start_date: string;
  readonly end_date: string;
  readonly is_open_for_registration: boolean;
  readonly registration_start_date: string;
  readonly registration_early_deadline: string;
  readonly registration_deadline: string;
  readonly registration_url: Url;
  readonly fees: EvanFee[];
  readonly sessions: EvanSession[];
  readonly tracks: EvanTrack[];
  readonly venues: EvanVenue[];
  readonly extra_data: {
    important_dates: ImportantDate[];
  };
}
