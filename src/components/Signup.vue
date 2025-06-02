<script lang="ts" setup>
import { ref } from 'vue';
import { invoke } from "@tauri-apps/api/core";

const username = ref('');
const email = ref('');
const password = ref('');
const fullName = ref(''); 
const phone = ref('');
const signUpMsg = ref('');
const emit = defineEmits(['show-login', 'close']);

const usernameRegex = ref(/^[a-zA-Z0-9_]{3,30}$/);                      // 3 to 30 characters, letters, numbers, or underscores
const passwordRegex = ref(/^\S{8,}$/);                                  // At least 8 characters
const fullNameRegex = ref(/^[a-zA-Z\s]{3,30}$/);                        // 3 to 30 characters, letters and spaces only
const phoneRegex = ref(/^\+?[0-9]{7,20}([-\s]?[0-9]{1,20})*$/);         // 7 to 20 digits, optional "+" at the start, optional hyphens or spaces
const emailregex = ref(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);                   // Valid email format

async function handleSignUp() {
    try {
        await invoke('add_user', {
        username: username.value.trim(), 
        email: email.value.trim(), 
        password: password.value.trim(),
        fullName: fullName.value.trim(),
        phone: phone.value.trim(), 
        });
        signUpMsg.value = "Account created successfully! Redirecting to login...";
        setTimeout(() => emit('show-login'), 1000);
    } catch (error) {
        console.error("Error during sign up:", error);
        signUpMsg.value = "Sign up failed. Please try again.";
    }
}

const showPassword = ref(false);
function togglePassword() {
  showPassword.value = !showPassword.value;
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
<form @submit.prevent="handleSignUp">
<fieldset class="fieldset">
  <legend class="text-2xl font-bold mb-4">Sign Up</legend>
  <div id="Username-input">
  <label class="input validator floating-label">
    <span>Username</span>
    <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <g
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="2.5"
        fill="none"
        stroke="currentColor"
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </g>
    </svg>
    <input
      v-model="username"
      type="text"
      required
      placeholder="Username"
      :pattern="usernameRegex.source"
      minlength="3"
      maxlength="30"
      title="Must be 3 to 30 characters"
    />
    </label>
    <p class="validator-hint hidden">
      Must be 3 to 30 characters
    </p>
  </div>

  <div id="fullname-input">
  <label class="input validator floating-label">
    <span>Full name</span>
    <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <g
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="2.5"
        fill="none"
        stroke="currentColor"
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </g>
    </svg>
    <input
      v-model="fullName"
      type="text"
      required
      placeholder="Full name"
      :pattern="fullNameRegex.source"
      minlength="3"
      maxlength="30"
      title="Must be 3 to 30 characters"
    />
    </label>
    <p class="validator-hint hidden">
      Must be 3 to 30 characters
    </p>
  </div>
  <div id="email-input">
    <label class="input validator floating-label">
    <span>Email</span>
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
    <input type="email" v-model="email" placeholder="Email" :pattern="emailregex.source" required />
    </label>
    <div class="validator-hint hidden">Enter valid email address</div>
  </div>

  <div id="password-input">
  <label class="input validator floating-label">
    <span>Password</span>
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
    <div class="relative">
      <input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        required
        placeholder="Password"
        minlength="8"
        :pattern="passwordRegex.source"
        title="Must be at least 8 characters"
        class="py-2.5 sm:py-3 ps-0 pe-20 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
      />
      <button
        type="button"
        @click="togglePassword"
        class="absolute inset-y-0 end-0 flex items-center z-20 px-0 cursor-pointer text-gray-400 rounded-e-md focus:outline-hidden focus:text-blue-600"
      >
        <svg
          v-if="showPassword"
          class="shrink-0 size-3.5"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <svg
          v-else
          class="shrink-0 size-3.5"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
          <line x1="2" x2="22" y1="2" y2="22"></line>
        </svg>
      </button>
    </div>
  </label>
  <p class="validator-hint hidden">
    Must be at least 8 characters
  </p>
  </div>

  <div id="phone-input">
    <label class="input validator floating-label">
    <span>Phone number</span>
    <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <g fill="none">
        <path
            d="M7.25 11.5C6.83579 11.5 6.5 11.8358 6.5 12.25C6.5 12.6642 6.83579 13 7.25 13H8.75C9.16421 13 9.5 12.6642 9.5 12.25C9.5 11.8358 9.16421 11.5 8.75 11.5H7.25Z"
            fill="currentColor"
        ></path>
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M6 1C4.61929 1 3.5 2.11929 3.5 3.5V12.5C3.5 13.8807 4.61929 15 6 15H10C11.3807 15 12.5 13.8807 12.5 12.5V3.5C12.5 2.11929 11.3807 1 10 1H6ZM10 2.5H9.5V3C9.5 3.27614 9.27614 3.5 9 3.5H7C6.72386 3.5 6.5 3.27614 6.5 3V2.5H6C5.44771 2.5 5 2.94772 5 3.5V12.5C5 13.0523 5.44772 13.5 6 13.5H10C10.5523 13.5 11 13.0523 11 12.5V3.5C11 2.94772 10.5523 2.5 10 2.5Z"
            fill="currentColor"
        ></path>
        </g>
    </svg>
    <input
        v-model="phone"
        type="tel"
        class="tabular-nums"
        required
        placeholder="Phone number"
        :pattern="phoneRegex.source"
        minlength="7"
        maxlength="20"
        title="Must be 7 to 20 digits"
    />
    </label>
    <p class="validator-hint hidden">Must be 7 to 20 digits</p>
  </div>

  <button type="submit" class="btn btn-primary mt-4">Sign Up</button>
  <p v-if="signUpMsg" class="mt-2 text-center">{{ signUpMsg }}</p>
</fieldset>
</form>
</div>
</div>
</div>
</template>
