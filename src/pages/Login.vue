<script lang="ts" setup>
import { ref } from 'vue';

const username = ref('');
const password = ref('');

function handleLogin() {
  console.log('Username:', username.value);
  console.log('Password:', password.value);
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
        <button type="submit" class="login-form-button">Login</button>
      </form>
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
.login-form-button {
  width: 100%;
  margin-top: 16px;
}
</style>