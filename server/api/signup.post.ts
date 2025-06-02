// server/api/signup.post.ts
import { db, userTable } from '~/server/lib/db';
import { generateSessionToken, createSession } from '~/server/lib/session';
import { setSessionTokenCookie } from '~/server/lib/cookies';
import { hash } from 'bcryptjs';

export default defineEventHandler(async (event) => {
	const body = await readBody<{ email: string; password: string }>(event);

	const hashedPassword = await hash(body.password, 10);
	const [user] = await db
		.insert(userTable)
		.values({ email: body.email, hashedPassword })
		.returning({ id: userTable.id });

	const token = generateSessionToken();
	const session = await createSession(token, user.id);

	setSessionTokenCookie(event, token, session.expiresAt);

	return { success: true };
});
