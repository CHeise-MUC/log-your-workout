import path from 'path';

// Path where Playwright saves the logged-in session (cookies + localStorage).
// This file is gitignored – it contains a real session token.
export const SESSION_FILE = path.join(__dirname, '.auth/session.json');
