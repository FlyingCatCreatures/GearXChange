<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { invoke } from "@tauri-apps/api/core";

const username = ref('');
const email = ref('');
const password = ref('');
const fullName = ref(''); 
const phone = ref('');
const location = ref('');
const signUpMsg = ref('');
const router = useRouter();

async function handleSignUp() {
  try {
    await invoke('add_user', {
      username: username.value.trim(), //TODO: instead of trimming just limit the input box
      email: email.value.trim(), // and here too
      password: password.value.trim(), // and here too
      fullName: fullName.value.trim(), // But not here though
      phone: phone.value.trim(), // and here too
      location: location.value.trim(), // But not here though
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
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="signup-form-field">
          <label for="email">Email:</label><br />
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="signup-form-field">
          <label for="password">Password:</label><br />
          <input type="password" id="password" v-model="password" required />
        </div>
        <div class="signup-form-field">
          <label for="fullName">Full Name:</label><br />
          <input type="text" id="fullName" v-model="fullName" required />
        </div>
        <div class="signup-form-field">
          <label for="phone">Phone:</label><br />
          <input type="text" id="phone" v-model="phone" required />
        </div>
        <div class="signup-form-field">
          <label for="location">Location:</label><br />
          <input type="text" id="location" v-model="location" required />
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
}
.signup-form-button {
  width: 100%;
  margin-top: 16px;
}
</style>