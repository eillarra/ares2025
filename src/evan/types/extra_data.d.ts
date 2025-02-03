interface ImportantDate {
  label: string;
  format: 'date' | 'range' | 'month';
  start_date: string;
  end_date: string | null;
  aoe: boolean;
  formatted?: string;
  is_past?: boolean;
}

interface Person {
  first_name: string;
  last_name: string;
  affiliation: string | null;
  email: string | null;
}

interface Committee {
  name: str;
  members: Person[];
  sorting: 'first_name' | 'last_name';
  display: 'full' | 'list';
}
