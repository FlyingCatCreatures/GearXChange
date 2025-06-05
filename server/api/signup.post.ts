// server/api/signup.post.ts
import { db, userTable } from '~/server/lib/db';
import { generateSessionToken, createSession } from '~/server/lib/session';
import { setSessionTokenCookie } from '~/server/lib/cookies';
import { hash } from 'bcryptjs';

import { z } from "zod/v4"; 
const User = z.object({ 
    email: z.email(),
    name: z.string(),
    password: z.string().min(8)
});

export default defineEventHandler(async (event) => {
	const body = await readBody<{ email: string; password: string , name: string}>(event);

    // Check that the thing to be verified match the required criteria
    const res = User.safeParse({email: body.email, password: body.password, name: body.name})
    if(!res.success){
        throw createError({ statusCode: 401, message: 'Invalid credentials' });
    }

	const hashedPassword = await hash(body.password, 10);
	const [user] = await db
		.insert(userTable)
		.values({ email: body.email, hashedPassword, name: body.name })
		.returning({ id: userTable.id });

	const token = generateSessionToken();
	const session = await createSession(token, user.id);

	setSessionTokenCookie(event, token, session.expiresAt);

	return { success: true };
});
