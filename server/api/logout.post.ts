// server/api/logout.post.ts
import { getCookie } from 'h3';
import { validateSessionToken, invalidateSession } from '~/server/lib/session';
import { deleteSessionTokenCookie } from '~/server/lib/cookies';

export default defineEventHandler(async (event) => {
	const token = getCookie(event, "session");
	if (!token) return { success: true };

	const { session } = await validateSessionToken(token);
	if (session) {
		await invalidateSession(session.id);
	}

	deleteSessionTokenCookie(event);

	return { success: true };
});
