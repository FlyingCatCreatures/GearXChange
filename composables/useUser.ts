import type { User } from "lucia";

// useState returns a reference to the user,
// which means that when the backend alters the user state and we update it by means of SyncUser in middleware/auth.global.ts
// all places that have called this function will have the value of the object returned retroactively changed
// Basically, this helps make UI react to the user's login status
export const useUser = () => {
  const user = useState<User | null>("user", () => null);
  return user;
};
