<script lang="ts" setup>
import { ref } from 'vue';
import { invoke } from "@tauri-apps/api/core";

const username = ref('');
const password = ref('');
const loginMsg = ref('');

async function handleLogin() {
    // the cast to boolean is not strictly necessary but it allows ts to infer the type
    // this invoke already returns a boolean so that's why it's not strictly necessary
    // but it makes the code clearer
    let verified = Boolean(await invoke('verify_user', { username: username.value.trim(), password: password.value.trim() })); //TODO: instead of trimming just limit the input box

    loginMsg.value = Boolean(verified) ? `Logged in successfully as ${username.value}` : "Login failed. Please check your credentials."; 
}

</script>



<template>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
  <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl relative">
    <!-- Close button -->
    <button
      type="button"
      @click="$emit('close')"
      class="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost"
      aria-label="Close login dialog"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <div class="card-body">
      <form @submit.prevent="handleLogin">
        <fieldset class="fieldset">
          <legend class="text-2xl font-bold">Login</legend>
          <label class="input validator mt-4">
            <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke-width="2.5"
                fill="none"
                stroke="currentColor"
              >
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </g>
            </svg>
            <input type="email" placeholder="mail@site.com" required />
          </label>
          <div class="validator-hint hidden">Enter valid email address</div>
          <label class="input validator">
            <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke-width="2.5"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                ></path>
                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
              </g>
            </svg>
            <input
              type="password"
              required
              placeholder="Password"
              minlength="8"
              pattern="/^\S{8,}$/"
              title="Must be at least than 8 characters"
            />
          </label>
          <p class="validator-hint hidden">
            Must be at least than 8 characters
          </p>
          <button type="submit" class="btn btn-primary mt-4">Login</button>
          <p class="text-error">{{ loginMsg }}</p>
        </fieldset>
      </form>
    </div>
  </div>
</div>
</template>