const AUTH_ENABLED_KEY = "nahali_auth_enabled";

export function isAuthEnabled(): boolean {
  const val = localStorage.getItem(AUTH_ENABLED_KEY);
  // Default: disabled (no login required)
  return val === "true";
}

export function setAuthEnabled(enabled: boolean) {
  localStorage.setItem(AUTH_ENABLED_KEY, String(enabled));
}
