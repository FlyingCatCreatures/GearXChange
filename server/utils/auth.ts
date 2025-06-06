import { Lucia } from "lucia";
import { adapter } from "~/server/utils/db";

// This definfes a bunch of stuff necessary for the Lucia library to actually be useable, like which attributes of the user are available
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // IMPORTANT!
    attributes: {
      // set to `true` when using HTTPS
      secure: !process.dev,
    },
  },
  // This defines which attributes of the user are visible to the main process
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      name: attributes.name,
      email: attributes.email,
      location: attributes.location,
    };
  },
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}
// The User type declaration
interface DatabaseUserAttributes {
  email: string;
  name: string;
  id: string;
  hashedPassword: string;
  location: string | null;
}
