// server/api/login.post.ts
import { db, userTable } from '~/server/lib/db';
import { eq } from 'drizzle-orm';
import { compare } from 'bcryptjs';
import { generateSessionToken, createSession } from '~/server/lib/session';
import { setSessionTokenCookie } from '~/server/lib/cookies';

export default defineEventHandler(async (event) => {
	const body = await readBody<{ email: string; password: string }>(event);

	const [user] = await db
		.select()
		.from(userTable)
		.where(eq(userTable.email, body.email))
		.limit(1);

	if (!user || !(await compare(body.password, user.hashedPassword))) {
		throw createError({ statusCode: 401, message: 'Invalid credentials' });
	}

	const token = generateSessionToken();
	const session = await createSession(token, user.id);

	setSessionTokenCookie(event, token, session.expiresAt);

	return { success: true };
});
