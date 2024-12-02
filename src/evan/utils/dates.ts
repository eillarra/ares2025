import { format } from 'date-fns';

function dateRange(startDate: string, endDate: string, includeYear: boolean = true): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startMonth = start.toLocaleString('default', { month: 'long' });
  const endMonth = end.toLocaleString('default', { month: 'long' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startYear = start.getFullYear();

  if (startMonth === endMonth) {
    if (includeYear) {
      return `${startMonth} ${startDay}-${endDay}, ${startYear}`;
    }
    return `${startMonth} ${startDay}-${endDay}`;
  }

  if (includeYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

function _formatImportantDateRange(date: ImportantDate): string {
  if (date.format === 'date') {
    return dateRange(date.start_date, date.end_date);
  }

  if (date.format === 'month') {
    return new Date(date.start_date).toLocaleString('default', { month: 'long' });
  }

  if (date.format === 'range') {
    return dateRange(date.start_date, date.end_date, false);
  }

  return '';
}

function formatImportantDate(date: ImportantDate): string {
  if (date.start_date !== date.end_date) {
    return _formatImportantDateRange(date);
  }

  if (date.format === 'date') {
    return format(new Date(date.start_date), 'MMMM d, yyyy');
  }

  if (date.format === 'month') {
    return format(new Date(date.start_date), 'MMMM yyyy');
  }

  return '';
}

export { dateRange, formatImportantDate };
