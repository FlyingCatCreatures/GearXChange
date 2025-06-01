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

const showPassword = ref(false);
function togglePassword() {
  showPassword.value = !showPassword.value;
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
        <div class="signup-form-field password-field">
          <label for="password">Password:</label><br />
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              pattern="^[\S]{8,}$"
              id="password"
              v-model="password"
              required
              maxlength="32"
              :class="[{ invalid: touched.password && invalid.password, valid: touched.password && !invalid.password }, { flash: flash.password }]"
              @input="e => handleInput('password', e, /\s/g, 32)"
              @blur="() => handleBlur('password')"
            />
            <button
              type="button"
              class="password-eye"
              @click="togglePassword"
              tabindex="-1"
              v-if="password.length > 0"
              aria-label="Toggle password visibility"
            >
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25ZM9.75 12C9.75 10.7574 10.7574 9.75 12 9.75C13.2426 9.75 14.25 10.7574 14.25 12C14.25 13.2426 13.2426 14.25 12 14.25C10.7574 14.25 9.75 13.2426 9.75 12Z"
                  fill="#1C274C"/>
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M12 3.25C7.48587 3.25 4.44529 5.9542 2.68057 8.24686L2.64874 8.2882C2.24964 8.80653 1.88206 9.28392 1.63269 9.8484C1.36564 10.4529 1.25 11.1117 1.25 12C1.25 12.8883 1.36564 13.5471 1.63269 14.1516C1.88206 14.7161 2.24964 15.1935 2.64875 15.7118L2.68057 15.7531C4.44529 18.0458 7.48587 20.75 12 20.75C16.5141 20.75 19.5547 18.0458 21.3194 15.7531L21.3512 15.7118C21.7504 15.1935 22.1179 14.7161 22.3673 14.1516C22.6344 13.5471 22.75 12.8883 22.75 12C22.75 11.1117 22.6344 10.4529 22.3673 9.8484C22.1179 9.28391 21.7504 8.80652 21.3512 8.28818L21.3194 8.24686C19.5547 5.9542 16.5141 3.25 12 3.25ZM3.86922 9.1618C5.49864 7.04492 8.15036 4.75 12 4.75C15.8496 4.75 18.5014 7.04492 20.1308 9.1618C20.5694 9.73159 20.8263 10.0721 20.9952 10.4545C21.1532 10.812 21.25 11.2489 21.25 12C21.25 12.7511 21.1532 13.188 20.9952 13.5455C20.8263 13.9279 20.5694 14.2684 20.1308 14.8382C18.5014 16.9551 15.8496 19.25 12 19.25C8.15036 19.25 5.49864 16.9551 3.86922 14.8382C3.43064 14.2684 3.17374 13.9279 3.00476 13.5455C2.84684 13.188 2.75 12.7511 2.75 12C2.75 11.2489 2.84684 10.812 3.00476 10.4545C3.17374 10.0721 3.43063 9.73159 3.86922 9.1618Z"
                  fill="#1C274C"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path
                  d="M2.68936 6.70456C2.52619 6.32384 2.08528 6.14747 1.70456 6.31064C1.32384 6.47381 1.14747 6.91472 1.31064 7.29544L2.68936 6.70456ZM15.5872 13.3287L15.3125 12.6308L15.5872 13.3287ZM9.04145 13.7377C9.26736 13.3906 9.16904 12.926 8.82185 12.7001C8.47466 12.4742 8.01008 12.5725 7.78417 12.9197L9.04145 13.7377ZM6.37136 15.091C6.14545 15.4381 6.24377 15.9027 6.59096 16.1286C6.93815 16.3545 7.40273 16.2562 7.62864 15.909L6.37136 15.091ZM22.6894 7.29544C22.8525 6.91472 22.6762 6.47381 22.2954 6.31064C21.9147 6.14747 21.4738 6.32384 21.3106 6.70456L22.6894 7.29544ZM19 11.1288L18.4867 10.582V10.582L19 11.1288ZM19.9697 13.1592C20.2626 13.4521 20.7374 13.4521 21.0303 13.1592C21.3232 12.8663 21.3232 12.3914 21.0303 12.0985L19.9697 13.1592ZM11.25 16.5C11.25 16.9142 11.5858 17.25 12 17.25C12.4142 17.25 12.75 16.9142 12.75 16.5H11.25ZM16.3714 15.909C16.5973 16.2562 17.0619 16.3545 17.409 16.1286C17.7562 15.9027 17.8545 15.4381 17.6286 15.091L16.3714 15.909ZM5.53033 11.6592C5.82322 11.3663 5.82322 10.8914 5.53033 10.5985C5.23744 10.3056 4.76256 10.3056 4.46967 10.5985L5.53033 11.6592ZM2.96967 12.0985C2.67678 12.3914 2.67678 12.8663 2.96967 13.1592C3.26256 13.4521 3.73744 13.4521 4.03033 13.1592L2.96967 12.0985ZM12 13.25C8.77611 13.25 6.46133 11.6446 4.9246 9.98966C4.15645 9.16243 3.59325 8.33284 3.22259 7.71014C3.03769 7.3995 2.90187 7.14232 2.8134 6.96537C2.76919 6.87696 2.73689 6.80875 2.71627 6.76411C2.70597 6.7418 2.69859 6.7254 2.69411 6.71533C2.69187 6.7103 2.69036 6.70684 2.68957 6.70503C2.68917 6.70413 2.68896 6.70363 2.68892 6.70355C2.68891 6.70351 2.68893 6.70357 2.68901 6.70374C2.68904 6.70382 2.68913 6.70403 2.68915 6.70407C2.68925 6.7043 2.68936 6.70456 2 7C1.31064 7.29544 1.31077 7.29575 1.31092 7.29609C1.31098 7.29624 1.31114 7.2966 1.31127 7.2969C1.31152 7.29749 1.31183 7.2982 1.31218 7.299C1.31287 7.30062 1.31376 7.30266 1.31483 7.30512C1.31698 7.31003 1.31988 7.31662 1.32353 7.32483C1.33083 7.34125 1.34115 7.36415 1.35453 7.39311C1.38127 7.45102 1.42026 7.5332 1.47176 7.63619C1.57469 7.84206 1.72794 8.13175 1.93366 8.47736C2.34425 9.16716 2.96855 10.0876 3.8254 11.0103C5.53867 12.8554 8.22389 14.75 12 14.75V13.25ZM15.3125 12.6308C14.3421 13.0128 13.2417 13.25 12 13.25V14.75C13.4382 14.75 14.7246 14.4742 15.8619 14.0266L15.3125 12.6308ZM7.78417 12.9197L6.37136 15.091L7.62864 15.909L9.04145 13.7377L7.78417 12.9197ZM22 7C21.3106 6.70456 21.3107 6.70441 21.3108 6.70427C21.3108 6.70423 21.3108 6.7041 21.3109 6.70402C21.3109 6.70388 21.311 6.70376 21.311 6.70368C21.3111 6.70352 21.3111 6.70349 21.3111 6.7036C21.311 6.7038 21.3107 6.70452 21.3101 6.70576C21.309 6.70823 21.307 6.71275 21.3041 6.71924C21.2983 6.73223 21.2889 6.75309 21.2758 6.78125C21.2495 6.83757 21.2086 6.92295 21.1526 7.03267C21.0406 7.25227 20.869 7.56831 20.6354 7.9432C20.1669 8.69516 19.4563 9.67197 18.4867 10.582L19.5133 11.6757C20.6023 10.6535 21.3917 9.56587 21.9085 8.73646C22.1676 8.32068 22.36 7.9668 22.4889 7.71415C22.5533 7.58775 22.602 7.48643 22.6353 7.41507C22.6519 7.37939 22.6647 7.35118 22.6737 7.33104C22.6782 7.32097 22.6818 7.31292 22.6844 7.30696C22.6857 7.30398 22.6867 7.30153 22.6876 7.2996C22.688 7.29864 22.6883 7.29781 22.6886 7.29712C22.6888 7.29677 22.6889 7.29646 22.689 7.29618C22.6891 7.29604 22.6892 7.29585 22.6892 7.29578C22.6893 7.29561 22.6894 7.29544 22 7ZM18.4867 10.582C17.6277 11.3882 16.5739 12.1343 15.3125 12.6308L15.8619 14.0266C17.3355 13.4466 18.5466 12.583 19.5133 11.6757L18.4867 10.582ZM18.4697 11.6592L19.9697 13.1592L21.0303 12.0985L19.5303 10.5985L18.4697 11.6592ZM11.25 14V16.5H12.75V14H11.25ZM14.9586 13.7377L16.3714 15.909L17.6286 15.091L16.2158 12.9197L14.9586 13.7377ZM4.46967 10.5985L2.96967 12.0985L4.03033 13.1592L5.53033 11.6592L4.46967 10.5985Z"
                  fill="#1C274C"
                />
              </svg>
            </button>
          </div>
          <!--                          alphanumeric of length 8 or more -->
        </div>
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

<style scoped>
.password-field .password-input-wrapper {
  position: relative;
  width: 100%;
}
.password-field input[type="password"],
.password-field input[type="text"] {
  padding-right: 38px;
}
.password-eye {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  z-index: 2;
}
.password-eye svg {
  display: block;
}
</style>