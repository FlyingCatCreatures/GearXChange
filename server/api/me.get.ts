export default defineEventHandler((event) => {
  // user is set by your server/middleware/auth.ts
  return event.context.user;
});
