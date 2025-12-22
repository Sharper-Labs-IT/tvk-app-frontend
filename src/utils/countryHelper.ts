// src/utils/countryHelper.ts

export const getCountryFromMobile = (mobile: string | undefined): string => {
  if (!mobile) return 'Unknown';

  // Remove all non-digit characters (including +)
  const cleanNumber = mobile.replace(/\D/g, '');

  if (cleanNumber.startsWith('94')) return 'Sri Lanka';
  if (cleanNumber.startsWith('91')) return 'India';
  if (cleanNumber.startsWith('44')) return 'United Kingdom';
  if (cleanNumber.startsWith('1')) return 'USA / Canada';
  if (cleanNumber.startsWith('61')) return 'Australia';
  if (cleanNumber.startsWith('971')) return 'UAE';

  return 'Global'; // Default fallback
};
