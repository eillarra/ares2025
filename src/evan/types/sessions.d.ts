interface EvanSession {
  self: ApiEndpoint;
  slug: string;
  code: string;
  title: string;
  description: MarkdownText | EmptyString;
  track: number;
  extra_data?: {
    committees: Committee[];
    important_dates: ImportantDate[];
  };
}
