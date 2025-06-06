// This makes the user object that useUser passes to the frontend sync to the user state in the session table in the backend
// This should be ran after any invocation to the server that changes user state,
// but if for some reason it isn't or the call is obstructed this is automatically called every 10 seconds
// (see /layouts/default.vue)
// P.S. you might wonder why we don't call this from the backend whenever the state changes, which would be ideal, but is not possible
// This is due to the way nuxt works, and there's nothing to really be done about it
export const SyncUser = async () => {
  const user = useUser();
  const data = await useRequestFetch()("/api/me");
  user.value = data;
};

// This makes it sync up when the nuxt router does certain things
// Not entirely sure what those certain things are, but the documentation of the authenticator we use said to do this
// This is not a one-stop-shop for preventing desyncs, hence why the above function is also exported and called when necessary
export default defineNuxtRouteMiddleware(async () => {
  return await SyncUser();
});
