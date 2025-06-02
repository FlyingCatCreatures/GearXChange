import { parseCookies as _parseCookies } from 'h3';

// Simple wrapper for h3's parseCookies for consistency
export function parseCookies(event: import('h3').H3Event) {
  return _parseCookies(event);
}
import type { H3Event } from 'h3';

export function setSessionTokenCookie(event: H3Event, token: string, expiresAt: Date) {
	const isProd = process.env.NODE_ENV === "production";
	setCookie(event, "session", token, {
		httpOnly: true,
		sameSite: "lax",
		secure: isProd,
		expires: expiresAt,
		path: "/"
	});
}

export function deleteSessionTokenCookie(event: H3Event) {
	const isProd = process.env.NODE_ENV === "production";
	setCookie(event, "session", "", {
		httpOnly: true,
		sameSite: "lax",
		secure: isProd,
		maxAge: 0,
		path: "/"
	});
}
