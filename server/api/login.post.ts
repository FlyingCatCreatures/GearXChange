// server/api/login.post.ts
import { db, userTable } from '~/server/utils/db';
import { eq } from 'drizzle-orm';
import { compare } from 'bcryptjs';
import { generateSessionToken, createSession } from '~/server/lib/session';
import { setSessionTokenCookie } from '~/server/lib/cookies';

import { z } from "zod/v4"; 
const User = z.object({ 
    email: z.email(),
    password: z.string().min(8)
});

export default defineEventHandler(async (event) => {
	const body = await readBody<{ email: string; password: string }>(event);

    // Check that the thing to be verified match the required criteria
    // Should never fail, as this is also checked in frontend, but the client may 
    const res = User.safeParse({email: body.email, password: body.password})
    if(!res.success){
        throw createError({ statusCode: 401, message: 'Invalid credentials' });
    }

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
