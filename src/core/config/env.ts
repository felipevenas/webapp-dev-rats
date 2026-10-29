export const appName = 'DevStreak';
// Empty means "/api/v1" (same-origin, proxied by Vite in development).
// In production point it to the API origin, e.g. https://api.devstreak.app/api/v1
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const termsVersion = '1.0';
export const maxRepositories = 3;
export const maxTargetDays = 365;
export const supportEmail = 'contato@devstreak.app';
