import type { AuthSession } from "./types";

const AUTH_KEY = "today-menu.auth";
const RECOMMENDATION_SESSION_KEY = "today-menu.recommendation-session";

function getSessionStorage() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

export function readAuthSession(): AuthSession | null {
  const value = getSessionStorage()?.getItem(AUTH_KEY);
  if (!value) return null;

  try {
    const session = JSON.parse(value) as AuthSession;
    if (Date.parse(session.expiresAt) <= Date.now()) {
      clearAuthSession();
      return null;
    }
    return session;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function saveAuthSession(session: AuthSession) {
  getSessionStorage()?.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  getSessionStorage()?.removeItem(AUTH_KEY);
  clearRecommendationSessionId();
}

export function readRecommendationSessionId() {
  return (
    getSessionStorage()?.getItem(RECOMMENDATION_SESSION_KEY) ?? null
  );
}

export function saveRecommendationSessionId(sessionId: string) {
  getSessionStorage()?.setItem(RECOMMENDATION_SESSION_KEY, sessionId);
}

export function clearRecommendationSessionId() {
  getSessionStorage()?.removeItem(RECOMMENDATION_SESSION_KEY);
}
