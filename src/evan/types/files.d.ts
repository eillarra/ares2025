interface EvanFile {
  readonly self: ApiEndpoint;
  readonly url: Url;
  readonly id: number;
  readonly type: 'public' | 'private';
  readonly tags: string[];
}
