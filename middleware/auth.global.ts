export const SyncUser = async()=>{
	const user = useUser();
	const data = await useRequestFetch()("/api/me");
	user.value = data;
}
export default defineNuxtRouteMiddleware(async () => {return await SyncUser() });