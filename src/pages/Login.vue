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

</script>



<template>
  <div class="login-outer">
    <div class="login-form-wrapper">
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="login-form-field">
          <label for="username">Username:</label><br />
          <input placeholder="Username" pattern="^[a-zA-Z0-9_]{3,20}$" type="text" id="username" v-model="username" required @input="username = username.replace(/[^a-zA-Z0-9_]/g, '')" />
          <!--                          alphanumeric of length 3-20 -->
        </div>
        <div class="login-form-field">
          <label for="password">Password:</label><br />
          <input placeholder="Password" pattern="^[\S]{8,}$" type="password" id="password" v-model="password" required @input="password = password.replace(/\s/g, '')" />
          <!--                          alphanumeric of length 8 or more -->
        </div>
        <div class="login-buttons">
          <button type="submit" class="login-form-button">Login</button>
        </div>
      </form>
      <p>{{ loginMsg }}</p>
    </div>
  </div>
</template>