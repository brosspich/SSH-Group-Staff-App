export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PROFILE: 'serviceuser',
  DEVICE_SESSION_ID: 'pos_device_session_id',
  THEME_PREFERENCE: 'app_theme_pref',
} as const;

export const APP_CONFIG = {
  API_TIMEOUT_MS: 15000,
  DEFAULT_DEBOUNCE_MS: 300,
  PAGINATION_LIMIT: 20,
} as const;
