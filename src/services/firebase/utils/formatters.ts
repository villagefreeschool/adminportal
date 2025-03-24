import _ from 'lodash';
import { Family, EmergencyContact } from '../models/types';

/**
 * Formats a contact into a readable string
 */
export function contactToString(contact: EmergencyContact | null): string {
  if (!contact) {
    return '';
  }
  const firstName = _.get(contact, 'firstName');
  const cellPhone = _.get(contact, 'cellPhone');
  const rel = _.get(contact, 'relationship');
  let str = '';
  if (!firstName) {
    return str;
  }
  str += firstName;
  if (rel) {
    str += ` (${rel})`;
  }
  if (cellPhone) {
    str += ` ${cellPhone}`;
  }
  return str;
}

/**
 * Generates a family name based on the last names of guardians and students
 */
export function calculatedNameForFamily(family: Family): string {
  return (
    _.chain([...family.students, ...family.guardians])
      .map((s) => (s.lastName ? s.lastName : '').trim())
      .sort()
      .uniq()
      .value()
      .join(' / ') + ' Family'
  );
}

/**
 * Returns a comma-separated list of guardian first names
 */
export function guardianNamesForFamily(family: Family): string {
  return _.chain(family.guardians)
    .map((g) => g.firstName)
    .join(', ')
    .value();
}
