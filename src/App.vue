<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

const userState = ref({ username: '', permission_level: 'none' });

async function fetchUserState() {
  try {
    const state = await invoke('get_user_state');
    userState.value = state as { username: string; permission_level: string };
  } catch (error) {
    console.error('Failed to fetch user state:', error);
  }
}

onMounted(() => {
  fetchUserState();

  // Listen for backend updates
  const unlisten = listen('user-state-updated', (event) => {
    userState.value = event.payload as { username: string; permission_level: string };
  });

  // Cleanup listener on unmount
  onUnmounted(() => {
    unlisten.then((fn) => fn());
  });
});

async function logout() {
  try {
    await invoke('log_out');
    userState.value = { username: '', permission_level: 'none' };
  } catch (error) {
    console.error('Failed to log out:', error);
  }
}
</script>

<template>
  <div>
    <nav class="navbar">
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
      <router-link to="/login">Login</router-link>
      <span style="flex:1"></span>
      <div class="account-info">
        <img src="@assets/account.svg" alt="Account" class="account-icon" />
        <span v-if="userState.permission_level !== 'none'">
          Logged in as {{ userState.username }}
          <button @click="logout">Logout</button>
        </span>
        <span v-else>Not logged in</span>
      </div>
    </nav>

    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.navbar {
  background-color: #1e1e1e;
  padding: 10px;
  color: white;
  display: flex;
  align-items: center;
}

.navbar a {
  color: white;
  margin-right: 10px;
  text-decoration: none;
}

.navbar a.router-link-active {
  font-weight: bold;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-icon {
  height: 24px;
  vertical-align: middle;
  filter: invert(1);
}

main {
  padding: 20px;
}
</style>

<style>

  :root {
    font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
    font-size: 16px;
    line-height: 24px;
    font-weight: 400;

    color: #0f0f0f;
    background-color: #f6f6f6;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      color: #f6f6f6;
      background-color: #2f2f2f;
    }
  }
</style>