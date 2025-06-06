import { Lucia } from "lucia";
import { adapter } from "~/server/utils/db";

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		// IMPORTANT!
		attributes: {
			// set to `true` when using HTTPS
			secure: !process.dev
		}
	},
    getUserAttributes: (attributes) => {
		return {
			// attributes has the type of DatabaseUserAttributes
			name: attributes.name,
            email: attributes.email,
            location: attributes.location,
		};
	}
});

// IMPORTANT!
declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
    	DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	email: string;
    name: string;
    id: string;
    hashedPassword: string;
    location: string;    
}