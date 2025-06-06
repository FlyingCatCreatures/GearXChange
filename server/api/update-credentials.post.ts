import { db, sessionTable, userTable } from "~/server/utils/db";
import { eq } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import { z } from "zod/v4";
import { lucia } from "../utils/auth";

const UpdateUser = z.object({
  name: z.union([z.string().optional(), z.null(), z.string()]),
  email: z.email().optional(),
  location: z.union([z.string(), z.null(), z.string().optional()]),
  password: z.union([z.string().optional(), z.string().min(8)]), // Optional, but if it does exist it must be 8 characters
});

export default defineEventHandler(async (event) => {
  // Get current user ID from session
  const userId = event.context.user?.id;
  if (!userId) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // Fetch the full user object using the permanent user id from session.userId
  const session = event.context.session;
  if (!session) {
    throw createError({ statusCode: 404, message: "Session not found" });
  }

  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  const body = await readBody<{
    name?: string;
    email?: string;
    password?: string;
    location?: string;
  }>(event);
  const res = UpdateUser.safeParse(body);
  if (!res.success) {
    throw createError({ statusCode: 400, message: "Invalid input" });
  }

  const updates: Record<string, any> = {};

  // Only update name if provided and different
  if (body.name && body.name !== user.name) {
    updates.name = body.name;
  }

  // Only update email if provided and different
  if (body.email && body.email !== user.email) {
    updates.email = body.email;
  }

  // Only update password if provided
  if (body.password) {
    updates.hashedPassword = await hash(body.password, {
      // recommended minimum parameters by lucia-auth
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
  }

  // Only update location if provided and different or not yet set
  if (body.location && user.location !== body.location) {
    updates.location = body.location;
  }

  //console.log(updates)
  if (Object.keys(updates).length === 0) {
    return { success: true, message: "No changes made." };
  }

  await db.update(userTable).set(updates).where(eq(userTable.id, user.id));
  return { success: true };
});
