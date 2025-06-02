// server/middleware/auth.ts
import { validateSessionToken } from '~/server/lib/session';
import { getCookie } from 'h3';

export default defineEventHandler(async (event) => {
	const token = getCookie(event, "session");
	if (!token) return;

	const result = await validateSessionToken(token);
	if (result.session && result.user) {
		event.context.user = result.user;
	}
});
