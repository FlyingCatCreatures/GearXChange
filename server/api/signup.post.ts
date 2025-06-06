// server/api/signup.post.ts
import { db, userTable } from '~/server/utils/db';
import { generateIdFromEntropySize, UserId } from "lucia";
import { SqliteError } from "better-sqlite3";
import { hash } from 'bcryptjs';
import { lucia } from '../utils/auth';

import { z } from "zod/v4"; 
const User = z.object({ 
    email: z.email(),
    name: z.string(),
    password: z.string().min(8)
});


export default defineEventHandler(async (event) => {
	const formData = await readFormData(event);
	const email = formData.get("email");
	const password = formData.get("password");
	const name = formData.get("name");
	const res = User.safeParse({email: email, name: name, password: password})
	if(res.error){
		throw createError({
			message: "Invalid password",
			statusCode: 400
		});
	}

	const passwordHash = hash(String(password), 10);
	const userId = generateIdFromEntropySize(10); // 16 characters long

	// TODO: check if username is already used
	await db.insert(userTable).values({
		id: userId, 
		name: name,
		email: email,
		password_hash: passwordHash,
		location: null
	});

	const session = await lucia.createSession(userId, {});
	appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
});
type s = UserId



	/*
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
*/