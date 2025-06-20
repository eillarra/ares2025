export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const createSearchMatcher = (searchQuery: string) => {
  const normalizedQuery = normalizeText(searchQuery);

  return (text: string): boolean => {
    if (!searchQuery.trim()) return true;
    return normalizeText(text).includes(normalizedQuery);
  };
};

export const searchInFields = (searchQuery: string, ...fields: (string | undefined | null)[]): boolean => {
  if (!searchQuery.trim()) return true;

  const matcher = createSearchMatcher(searchQuery);

  return fields.some((field) => {
    if (!field) return false;
    return matcher(field);
  });
};
