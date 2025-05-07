interface EvanSubsession {
  readonly self: ApiEndpoint;
  readonly id: number;
  readonly title: string | EmptyString;
  readonly program: MarkdownText | EmptyString;
  readonly start_at: string | null;
  readonly end_at: string | null;
  readonly order: number;
  readonly session: number;
  readonly updated_at: string;
  readonly papers: EvanPaper[];
}
