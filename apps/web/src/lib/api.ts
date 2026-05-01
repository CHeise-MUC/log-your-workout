// Central API configuration.
// All fetch calls go through this helper so the base URL is defined exactly once.
// Change NEXT_PUBLIC_API_URL in .env.local to point to a different backend.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

/**
 * Build a full API URL from a path.
 * @example apiUrl('/workout-sessions') → 'http://localhost:3001/v1/workout-sessions'
 */
export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}
