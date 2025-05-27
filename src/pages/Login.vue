<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { invoke } from "@tauri-apps/api/core";

const username = ref('');
const password = ref('');
const loginMsg = ref('');
const router = useRouter();

async function handleLogin() {
    // the cast to boolean is not strictly necessary but it allows ts to infer the type
    // this invoke already returns a boolean so that's why it's not strictly necessary
    // but it makes the code clearer
    let verified = Boolean(await invoke('verify_user', { username: username.value.trim(), password: password.value.trim() })); //TODO: instead of trimming just limit the input box

    loginMsg.value = Boolean(verified) ? `Logged in successfully as ${username.value}` : "Login failed. Please check your credentials."; 
    router.push('/');
}

function goToSignUp() {
  router.push('/signup');
}
</script>



<template>
  <div class="login-outer">
    <div class="login-form-wrapper">
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="login-form-field">
          <label for="username">Username:</label><br />
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="login-form-field">
          <label for="password">Password:</label><br />
          <input type="password" id="password" v-model="password" required />
        </div>
        <div class="login-buttons">
          <button type="submit" class="login-form-button">Login</button>
        </div>
      </form>
      <p>{{ loginMsg }}</p>
    </div>
  </div>
</template>

<style scoped>
.login-outer {
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-form-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.login-form {
  width: 100%;
  max-width: 320px;
}
.login-form-field {
  width: 100%;
  margin-top: 10px;
}
.login-form-field:first-child {
  margin-top: 0;
}
.login-form input {
  width: 100%;
  box-sizing: border-box;
}
.login-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
}
.login-form-button,
.signup-button {
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}
.login-form-button {
  background-color: #007bff;
  color: white;
  border: none;
}
.signup-button {
  background-color: #28a745;
  color: white;
  border: none;
}
.signup-button:hover {
  background-color: #218838;
}
.login-form-button:hover {
  background-color: #0056b3;
}
</style>