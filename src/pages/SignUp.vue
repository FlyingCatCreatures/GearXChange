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
      invalid.value.email = !/^\S+@\S+\.\S+$/.test(value);
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
</script>

<template>
  <div class="signup-outer">
    <div class="signup-form-wrapper">
      <form @submit.prevent="handleSignUp" class="signup-form">
        <div class="signup-form-field">
          <label for="username">Username:</label><br />
          <input placeholder="Username" pattern="^[a-zA-Z0-9_]{3,20}$" type="text" id="username" v-model="username" required
            maxlength="20"
            :class="[{ invalid: touched.username && invalid.username, valid: touched.username && !invalid.username }, { flash: flash.username }]"
            @input="e => handleInput('username', e, /[^a-zA-Z0-9_]/g, 20)"
            @blur="() => handleBlur('username')"
          />
          <!--                          alphanumeric of length 3-20 -->
        </div>
        <div class="signup-form-field">
          <label for="email">Email:</label><br />
          <input placeholder="Email" type="email" id="email" v-model="email" required
            :class="[{ invalid: touched.email && invalid.email, valid: touched.email && !invalid.email }]"
            @blur="() => handleBlur('email')"
          />
        </div>
        <div class="signup-form-field">
          <label for="password">Password:</label><br />
          <input placeholder="Password" pattern="^[\S]{8,}$" type="password" id="password" v-model="password" required
            maxlength="32"
            :class="[{ invalid: touched.password && invalid.password, valid: touched.password && !invalid.password }, { flash: flash.password }]"
            @input="e => handleInput('password', e, /\s/g, 32)"
            @blur="() => handleBlur('password')"
          />
          <!--                          alphanumeric of length 8 or more -->        </div>
        <div class="signup-form-field">
          <label for="fullName">Full Name:</label><br />
          <input placeholder="Full Name" pattern="^[A-Za-z][A-Za-z\s\-']{1,48}[A-Za-z]$" type="text" id="fullName" v-model="fullName" required
            maxlength="50"
            :class="[{ invalid: touched.fullName && invalid.fullName, valid: touched.fullName && !invalid.fullName }, { flash: flash.fullName }]"
            @input="e => handleInput('fullName', e, /[^A-Za-z\s\-']/g, 50)"
            @blur="() => handleBlur('fullName')"
          />
          <!--                           a list of at least two names each starting with capital letters -->
        </div>
        <div class="signup-form-field">
          <label for="phone">Phone:</label><br />
          <input placeholder="Phone number" pattern="^\+?[0-9\s\-]{7,20}$" type="text" id="phone" v-model="phone" required
            maxlength="20"
            :class="[{ invalid: touched.phone && invalid.phone, valid: touched.phone && !invalid.phone }, { flash: flash.phone }]"
            @input="e => handleInput('phone', e, /[^0-9\s\-+]/g, 20)"
            @blur="() => handleBlur('phone')"
          />
        </div>
        <button type="submit" class="signup-form-button">Sign Up</button>
      </form>
      <p>{{ signUpMsg }}</p>
    </div>
  </div>
</template>

<style scoped>
.signup-outer {
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.signup-form-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.signup-form {
  width: 100%;
  max-width: 320px;
}
.signup-form-field {
  width: 100%;
  margin-top: 10px;
}
.signup-form-field:first-child {
  margin-top: 0;
}
.signup-form input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border-radius: 5px;
  border: 1.5px solid #24c8db;
  font-size: 1em;
  margin-top: 4px;
  margin-bottom: 8px;
  transition: border-color 0.2s, box-shadow 0.2s, border-width 0.15s;
}
.signup-form input:focus {
  outline: none;
  border-color: #1ba7b8;
  box-shadow: 0 0 0 2px #24c8db33;
}
.signup-form input.invalid {
  border-color: #e74c3c;
  background: #fff6f6;
}
.signup-form input.valid {
  border-color: #28a745;
  background: #f6fff6;
}
.signup-form input.flash {
  border-color: #e74c3c;
  border-width: 3px;
  transition: border-width 0.15s, border-color 0.15s;
}
.signup-form-button {
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  background-color: #28a745;
  color: white;
  border: none;
  margin-top: 16px;
}
.signup-form-button:hover {
  background-color: #218838;
}
</style>