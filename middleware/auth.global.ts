import type { DatabaseUser } from "lucia";

export default defineNuxtRouteMiddleware(async () => {
	const user = useUser();
	const data = await useRequestFetch()("/api/me");
	user.value = data;
});