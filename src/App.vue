<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

const userState = ref({ username: '', permission_level: 'none' });
const showDropdown = ref(false);

async function fetchUserState() {
  try {
    const state = await invoke('get_user_state');
    userState.value = state as { username: string; permission_level: string };
  } catch (error) {
    console.error('Failed to fetch user state:', error);
  }
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function closeDropdown(e: MouseEvent) {
  const dropdown = document.querySelector('.account-dropdown');
  const icon = document.querySelector('.account-icon-btn');
  if (dropdown && icon && !dropdown.contains(e.target as Node) && !icon.contains(e.target as Node)) {
    showDropdown.value = false;
  }
}

onMounted(() => {
  fetchUserState();
  document.addEventListener('click', closeDropdown);
  // Listen for backend updates
  const unlisten = listen('user-state-updated', (event) => {
    userState.value = event.payload as { username: string; permission_level: string };
  });
  // Cleanup listener on unmount
  onUnmounted(() => {
    unlisten.then((fn) => fn());
    document.removeEventListener('click', closeDropdown);
  });
});

async function logout() {
  try {
    await invoke('log_out');
    userState.value = { username: '', permission_level: 'none' };
    showDropdown.value = false;
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
      <span style="flex:1"></span>
      <div class="account-info">
        <button class="account-icon-btn" @click.stop="toggleDropdown" aria-label="Account menu">
          <img src="@assets/account.svg" alt="Account" class="account-icon" />
        </button>
        <div v-if="showDropdown" class="account-dropdown">
          <template v-if="userState.permission_level !== 'none'">
            <div class="dropdown-item"><b>{{ userState.username }}</b></div>
            <router-link to="/profile" class="dropdown-item hotfix" >Profile</router-link>
            <button @click="logout" class="dropdown-item">Logout</button>
          </template>
          <template v-else>
            <router-link to="/login" class="dropdown-item hotfix">Login</router-link>
            <router-link to="/signup" class="dropdown-item hotfix">Sign Up</router-link>
          </template>
        </div>
        <span v-if="userState.permission_level !== 'none'">
          Logged in as {{ userState.username }}
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

.account-icon-btn {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.hotfix {
    margin-left: 10px;
}
.account-dropdown {
  position: absolute;
  right: 10px;
  top: 48px;
  background: #222;
  color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  min-width: 160px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; 
  padding: 8px;
  box-sizing: border-box;
}

.dropdown-item {
  padding: 10px 10px; 
  color: #fff;
  text-align: center;
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
  border-radius: 5px;
  box-sizing: border-box;
}

.dropdown-item:hover {
  background: #444;
}

.account-info {
  position: relative;
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

.logout {
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.logout:hover {
  background-color: white;
  color: #1e1e1e;
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