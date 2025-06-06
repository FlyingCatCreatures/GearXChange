// server/api/login.post.ts
import { db, userTable } from '~/server/utils/db';
import { eq } from 'drizzle-orm';
import { verify } from "@node-rs/argon2";



import { z } from "zod/v4"; 
import { lucia } from '../utils/auth';
const User = z.object({ 
    email: z.email(),
    password: z.string().min(8)
});


export default eventHandler(async (event) => {
	const formData = await readFormData(event);
	const email = String(formData.get("email"));
	const password = String(formData.get("password"));
    const res = User.safeParse({email: email, password: password})
    if(res.error){
        throw createError({
			message: "Invalid input",
			statusCode: 400
		});
    }

    const [existingUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

	if (!existingUser) {
		throw createError({
			message: "Incorrect username",
			statusCode: 400
		});
	}

	const validPassword = await verify(existingUser.hashedPassword, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	if (!validPassword) {
		throw createError({
			message: "Password",
			statusCode: 400
		});
	}

	const session = await lucia.createSession(existingUser.id, {});
	appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
});
