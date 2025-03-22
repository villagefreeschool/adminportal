import _ from 'lodash';

/**
 * Format a date string to a readable format
 * @param dateString Date string to format
 * @param format Format to use (default: 'MM/DD/YYYY')
 */
export function formatDate(dateString: string | Date, format = 'MM/DD/YYYY'): string {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  let formattedDate = format;
  formattedDate = formattedDate.replace('MM', month);
  formattedDate = formattedDate.replace('DD', day);
  formattedDate = formattedDate.replace('YYYY', year.toString());
  
  return formattedDate;
}

/**
 * Group an array of objects by a specific key using lodash
 * @param array Array to group
 * @param key Key to group by
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return _.groupBy(array, key);
}

/**
 * Sort an array of objects by a specific key using lodash
 * @param array Array to sort
 * @param key Key to sort by
 * @param order Sort order ('asc' or 'desc')
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  const sorted = _.sortBy(array, key);
  return order === 'desc' ? sorted.reverse() : sorted;
}

/**
 * Deep clone an object using lodash
 * @param obj Object to clone
 */
export function deepClone<T>(obj: T): T {
  return _.cloneDeep(obj);
}

/**
 * Debounce a function using lodash
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 300
): (...args: Parameters<T>) => void {
  return _.debounce(func, wait);
}

/**
 * Throttle a function using lodash
 * @param func Function to throttle
 * @param wait Wait time in milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait = 300
): (...args: Parameters<T>) => void {
  return _.throttle(func, wait);
}
