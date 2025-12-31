// src/utils/countryHelper.ts

import { PHONE_CODES } from '../constants/phoneCodes';

export const getCountryFromMobile = (mobile: string | undefined): string => {
  if (!mobile) return 'Global';

  // Ensure mobile starts with + for matching
  const formattedMobile = mobile.startsWith('+') ? mobile : `+${mobile}`;

  // Sort codes by length (descending) to match longest prefix first (e.g. +1-242 before +1)
  const sortedCodes = [...PHONE_CODES].sort((a, b) => b.code.length - a.code.length);

  const found = sortedCodes.find(c => formattedMobile.startsWith(c.code));

  return found ? found.country : 'Global';
};
