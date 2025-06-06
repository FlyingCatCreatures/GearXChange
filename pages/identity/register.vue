<template>
  <div
    class="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center pointer-events-none"
  >
    <div
      class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl relative pointer-events-auto"
    >
      <div class="card-body">
        <form @submit.prevent="handleSignup" class="space-y-4">
          <div>
            <label class="floating-label">
              <span>Name</span>
              <input
                name="name"
                v-model="name"
                type="text"
                required
                placeholder="Name"
                class="input"
              />
            </label>
          </div>
          <div>
            <label class="floating-label">
              <span>Email</span>
              <input
                name="email"
                v-model="email"
                type="text"
                class="input"
                required
                placeholder="Email"
              />
            </label>
          </div>
          <div>
            <label class="floating-label">
              <span>password</span>
              <input
                name="password"
                v-model="password"
                type="password"
                required
                placeholder="Password"
                class="input"
              />
            </label>
          </div>

          <div>
            <button type="submit" :disabled="loading" class="btn">
              {{ loading ? "Creating account..." : "Sign up" }}
            </button>
          </div>
          <p v-if="error" class="text-error whitespace-pre-line">{{ error }}</p>
          <p class="text-sm">
            Want to login instead?
            <NuxtLink to="/identity/login" class="text-accent">Login</NuxtLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const name = ref("");

import { z } from "zod/v4";
import { SyncUser } from "~/middleware/auth.global";

// A zod object like this allows for really easy and readable input validation
const User = z.object({
  email: z.email(),
  name: z.string(),
  password: z.string().min(8),
});

async function handleSignup(e: Event) {
  e.preventDefault();
  loading.value = true;
  error.value = "";

  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);

  // Here we use the previously defined zod schema to try to parse the form
  // Returns something with field success=false if formdata is invalid,
  // like for example if email is not a valid email or password is not at least 8 characters
  const parsed = User.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    error.value = parsed.error.issues.map((issue) => issue.message).join("\n");
    loading.value = false;
    return;
  }

  try {
    await $fetch("/api/signup", {
      method: "POST",
      body: formData,
    })
      // We're changing userstate with this server invocation,
      // which means we want to update the reference the useUser() function returns throughout various files and components
      // The SyncUser command does that, to prevent desyncing the server's userstate and the client's
      // For more information see /composables/useUser.ts and /middleware/auth.global.ts
      .then(SyncUser);

    useToast().triggerToast("Signed up and Logged in successfully");
    navigateTo("/"); // Go to home page after either signing up
  } catch (err: any) {
    error.value = err?.data?.message ?? "Signup failed";
  } finally {
    loading.value = false;
  }
}
</script>
