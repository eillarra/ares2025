interface EvanSession {
  readonly self: ApiEndpoint;
  readonly id: number;
  readonly slug: string;
  readonly code: string;
  readonly title: string;
  readonly description: MarkdownText | EmptyString;
  readonly is_social_event: boolean;
  readonly extra_attendees_fee: number;
  readonly start_at: string;
  readonly end_at: string;
  readonly track: number | null;
  readonly extra_data: {
    committees: Committee[];
    important_dates: ImportantDate[];
  };
  // ----
  submission_deadline?: ImportantDate | null;
}
