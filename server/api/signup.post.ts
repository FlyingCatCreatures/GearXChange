// server/api/signup.post.ts
import { db, userTable } from '~/server/utils/db';
import { generateIdFromEntropySize, UserId } from "lucia";
import { hash } from "@node-rs/argon2";
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
			message: "Invalid input",
			statusCode: 400
		});
	}

	const passwordHash = await hash(String(password), {
		// recommended minimum parameters by lucia-auth
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
    const userId = generateIdFromEntropySize(10);

    await db.insert(userTable).values({
        id: userId,
        name: String(name),
        email: String(email),
        hashedPassword: passwordHash,
        location: null
    });


	const session = await lucia.createSession(userId, {});
	appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
});