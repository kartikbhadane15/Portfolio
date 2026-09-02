/**
 * Format project start and end dates with Month and Year (e.g. "Jan 2024 – Apr 2024", "Aug 2024 – Present")
 */
export function formatProjectDuration(startDate, endDate, fallbackDate) {
  const formatMonthYear = (d) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const startFormatted = formatMonthYear(startDate);
  const endFormatted = formatMonthYear(endDate);

  if (startFormatted && endFormatted) {
    // Same month and year
    if (startFormatted === endFormatted) {
      return startFormatted;
    }
    return `${startFormatted} – ${endFormatted}`;
  }

  if (startFormatted && !endFormatted) {
    return `${startFormatted} – Present`;
  }

  if (!startFormatted && endFormatted) {
    return endFormatted;
  }

  // Fallback to fallbackDate or year
  if (fallbackDate) {
    return formatMonthYear(fallbackDate) || new Date(fallbackDate).getFullYear().toString();
  }

  return '';
}
