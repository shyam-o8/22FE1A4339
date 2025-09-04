export const generateShortCode = (length: number = 6): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidShortCode = (shortCode: string): boolean => {
  return /^[a-zA-Z0-9]{3,20}$/.test(shortCode);
};

export const formatDateTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleString();
};

export const getLocationMock = (): string => {
  const locations = ['New York, US', 'London, UK', 'Tokyo, JP', 'Sydney, AU', 'Berlin, DE'];
  return locations[Math.floor(Math.random() * locations.length)];
};

export const getReferrer = (): string => {
  return document.referrer || 'Direct';
};