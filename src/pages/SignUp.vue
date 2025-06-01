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

async function handleSignUp() {
  try {
    await invoke('add_user', {
      username: username.value.trim(), //TODO: instead of trimming just limit the input box
      email: email.value.trim(), // and here too
      password: password.value.trim(), // and here too
      fullName: fullName.value.trim(), // But not here though
      phone: phone.value.trim(), // and here too
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
          <input placeholder="Username" pattern="[a-zA-Z0-9_]{3,20}" type="text" id="username" v-model="username" required />
          <!--                          alphanumeric of length 3-20 -->
        </div>
        <div class="signup-form-field">
          <label for="email">Email:</label><br />
          <input placeholder="Email" type="email" id="email" v-model="email" required /> <!-- Email input type is automatically sanitised according to https://www.w3schools.com/html/html_form_input_types.asp -->
        </div>
        <div class="signup-form-field">
          <label for="password">Password:</label><br />
          <input placeholder="Password" pattern="^[a-zA-Z0-9]{8,}$" type="password" id="password" v-model="password" required />
          <!--                          alphanumeric of length 8 or more -->        </div>
        <div class="signup-form-field">
          <label for="fullName">Full Name:</label><br />
          <input placeholder="Full Name" pattern="^([A-Z][a-z]+)(\s[A-Z][a-z]+)+$" type="text" id="fullName" v-model="fullName" required />
          <!--                           a list of at least two names each starting with capital letters -->
        </div>
        <div class="signup-form-field">
          <label for="phone">Phone:</label><br />
          <input placeholder="Phone number" pattern="^\+?[0-9\s\-]{10,20}$" type="text" id="phone" v-model="phone" required />
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