<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { invoke } from "@tauri-apps/api/core";

const username = ref('');
const email = ref('');
const password = ref('');
const fullName = ref(''); 
const phone = ref('');
const signUpMsg = ref('');
const router = useRouter();

// Validation state
type Field = "username" | "email" | "password" | "fullName" | "phone";
const touched = ref<Record<Field, boolean>>({ username: false, email: false, password: false, fullName: false, phone: false });
const invalid = ref<Record<Field, boolean>>({ username: false, email: false, password: false, fullName: false, phone: false });
const flash = ref<Record<Field, boolean>>({ username: false, email: false, password: false, fullName: false, phone: false });

// Validation regexes
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
const passwordRegex = /^\S{8,}$/;
const fullNameRegex = /^[A-Za-z][A-Za-z\s\-']{1,48}[A-Za-z]$/;
const phoneRegex = /^\+?[0-9\s\-]{7,20}$/;
const emailregex = /^\S+@\S+\.\S+$/;

function validateField(field: string, value: string) {
  switch (field) {
    case 'username':
      invalid.value.username = !usernameRegex.test(value);
      break;
    case 'password':
      invalid.value.password = !passwordRegex.test(value);
      break;
    case 'fullName':
      invalid.value.fullName = !fullNameRegex.test(value);
      break;
    case 'phone':
      invalid.value.phone = !phoneRegex.test(value);
      break;
    case 'email':
      // Use a simple email regex for live validation
      invalid.value.email = !emailregex.test(value);
      break;
  }
}

function handleInput(field: Field, e: Event, regex: RegExp, maxLen: number) {
  let val = (e.target as HTMLInputElement).value;
  // Remove illegal chars and cap length
  let legal = val.replace(regex, '').slice(0, maxLen);
  if (val !== legal) {
    flash.value[field] = true;
    setTimeout(() => (flash.value[field] = false), 200);
  }
  (e.target as HTMLInputElement).value = legal;
  // Update ref
  switch (field) {
    case 'username': username.value = legal; break;
    case 'password': password.value = legal; break;
    case 'fullName': fullName.value = legal; break;
    case 'phone': phone.value = legal; break;
    case 'email': email.value = legal; break;
  }
  // Mark as touched so validation color shows immediately
  touched.value[field] = true;
  validateField(field, legal);
}

function handleBlur(field: Field) {
  touched.value[field] = true;
  validateField(field, eval(field + '.value'));
}

async function handleSignUp() {
  // Mark all as touched and validate (and update on every field)
  (Object.keys(touched.value) as Field[]).forEach(f => {
    touched.value[f] = true;
    // Always validate with the latest value
    let val = '';
    switch (f) {
      case 'username': val = username.value; break;
      case 'email': val = email.value; break;
      case 'password': val = password.value; break;
      case 'fullName': val = fullName.value; break;
      case 'phone': val = phone.value; break;
    }
    validateField(f, val);
  });
  if (Object.values(invalid.value).some(v => v)) {
    signUpMsg.value = "Please fix the highlighted fields.";
    return;
  }
  try {
    await invoke('add_user', {
      username: username.value.trim(), 
      email: email.value.trim(), 
      password: password.value.trim(),
      fullName: fullName.value.trim(),
      phone: phone.value.trim(), 
    });
    signUpMsg.value = "Account created successfully! Redirecting to login...";
    setTimeout(() => router.push('/login'), 2000);
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
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Sign Up</h2>
      <form @submit.prevent="handleSignUp" class="space-y-4">
        <div class="form-control">
          <label for="username" class="mt-4 text-center text-sm text-gray-600">
            <span class="label-text">Username</span>
          </label>
          <input placeholder="Username" pattern="^[a-zA-Z0-9_]{3,20}$" type="text" id="username" v-model="username" required
            maxlength="20" class="input input-bordered w-full"
            :class="[{ invalid: touched.username && invalid.username, valid: touched.username && !invalid.username }, { flash: flash.username }]"
            @input="e => handleInput('username', e, /[^a-zA-Z0-9_]/g, 20)"
            @blur="() => handleBlur('username')"
          />
        </div>
        
        <div class="signup-form-field">
          <label for="email" class="mt-4 text-center text-sm text-gray-600">
            <span class="label-text">Email</span>
          </label>
          <input placeholder="Email" type="email" id="email" v-model="email" required
            class="input input-bordered w-full"
            :class="[{ invalid: touched.email && invalid.email, valid: touched.email && !invalid.email }]"
            @blur="() => handleBlur('email')"
            @input="e => handleInput('email', e, /[^\w@.+-]/g, 50)"
          />
        </div>

        <div class="signup-form-field password-field">
          <label for="password" class="mt-4 text-center text-sm text-gray-600">
            <span class="label-text">Password</span>
          </label>          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              pattern="^[\S]{8,}$"
              id="password"
              v-model="password"
              required
              maxlength="32"
              class="input input-bordered w-full"
              :class="[{ invalid: touched.password && invalid.password, valid: touched.password && !invalid.password }, { flash: flash.password }]"
              @input="e => handleInput('password', e, /\s/g, 32)"
              @blur="() => handleBlur('password')"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center px-3"
              @click="togglePassword"
              v-if="password.length > 0"
              aria-label="Toggle password visibility"
            >
              <img v-if="showPassword" src="@/assets/eye-open.svg" alt="Hide password" width="24" height="24" />
              <img v-else src="@/assets/eye-closed.svg" alt="Show password" width="24" height="24" />
            </button>
          </div>
        </div>

        <div class="signup-form-field">
          <label for="fullName" class="mt-4 text-center text-sm text-gray-600">
            <span class="label-text">Full name</span>
          </label>          
          <input placeholder="Full Name" pattern="^[A-Za-z][A-Za-z\s\-']{1,48}[A-Za-z]$" type="text" id="fullName" v-model="fullName" required
            maxlength="50" class="input input-bordered w-full"
            :class="[{ invalid: touched.fullName && invalid.fullName, valid: touched.fullName && !invalid.fullName }, { flash: flash.fullName }]"
            @input="e => handleInput('fullName', e, /[^A-Za-z\s\-']/g, 50)"
            @blur="() => handleBlur('fullName')"
          />
        </div>

        <div class="signup-form-field">
          <label for="phone" class="mt-4 text-center text-sm text-gray-600">
            <span class="label-text">Phone number</span>
          </label>          
          <input placeholder="Phone number" pattern="^\+?[0-9\s\-]{7,20}$" type="text" id="phone" v-model="phone" required
            maxlength="20" class="input input-bordered w-full"
            :class="[{ invalid: touched.phone && invalid.phone, valid: touched.phone && !invalid.phone }, { flash: flash.phone }]"
            @input="e => handleInput('phone', e, /[^0-9\s\-+]/g, 20)"
            @blur="() => handleBlur('phone')"
          />
        </div>
        <button type="submit" class="btn btn-primary w-full">Sign Up</button>
      </form>
      <p class="mt-4 text-center text-sm text-gray-600">{{ signUpMsg }}</p>
    </div>
  </div>
</template>