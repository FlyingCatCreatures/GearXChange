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
  <div class="navbar bg-base-100 shadow-sm">
    <div class="flex-1">
      <router-link
        to="/"
        class="btn text-xl"
        :class="$route.path === '/' ? 'btn-primary' : 'btn-ghost'"
      >Home</router-link>
      <router-link
        to="/sell"
        class="btn text-xl"
        :class="$route.path === '/sell' ? 'btn-primary' : 'btn-ghost'"
      >Sell product</router-link>
      <router-link
        to="/rent"
        class="btn text-xl"
        :class="$route.path === '/rent' ? 'btn-primary' : 'btn-ghost'"
      >Rent product</router-link>
      <router-link
        to="/fav"
        class="btn text-xl"
        :class="$route.path === '/fav' ? 'btn-primary' : 'btn-ghost'"
      >Favourites</router-link>
      <router-link
        to="/hist"
        class="btn text-xl"
        :class="$route.path === '/hist' ? 'btn-primary' : 'btn-ghost'"
      >History</router-link>
      <router-link
        to="/about"
        class="btn text-xl"
        :class="$route.path === '/about' ? 'btn-primary' : 'btn-ghost'"
      >About</router-link>
    </div>
    <div class="dropdown dropdown-end">
      <div tabindex="0" class="btn btn-ghost btn-circle avatar">
        <div class="w-10 rounded-full">
          <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M16 7.992C16 3.58 12.416 0 8 0S0 3.58 0 7.992c0 2.43 1.104 4.62 2.832 6.09.016.016.032.016.032.032.144.112.288.224.448.336.08.048.144.111.224.175A7.98 7.98 0 0 0 8.016 16a7.98 7.98 0 0 0 4.48-1.375c.08-.048.144-.111.224-.16.144-.111.304-.223.448-.335.016-.016.032-.016.032-.032 1.696-1.487 2.8-3.676 2.8-6.106zm-8 7.001c-1.504 0-2.88-.48-4.016-1.279.016-.128.048-.255.08-.383a4.17 4.17 0 0 1 .416-.991c.176-.304.384-.576.64-.816.24-.24.528-.463.816-.639.304-.176.624-.304.976-.4A4.15 4.15 0 0 1 8 10.342a4.185 4.185 0 0 1 2.928 1.166c.368.368.656.8.864 1.295.112.288.192.592.24.911A7.03 7.03 0 0 1 8 14.993zm-2.448-7.4a2.49 2.49 0 0 1-.208-1.024c0-.351.064-.703.208-1.023.144-.32.336-.607.576-.847.24-.24.528-.431.848-.575.32-.144.672-.208 1.024-.208.368 0 .704.064 1.024.208.32.144.608.336.848.575.24.24.432.528.576.847.144.32.208.672.208 1.023 0 .368-.064.704-.208 1.023a2.84 2.84 0 0 1-.576.848 2.84 2.84 0 0 1-.848.575 2.715 2.715 0 0 1-2.064 0 2.84 2.84 0 0 1-.848-.575 2.526 2.526 0 0 1-.56-.848zm7.424 5.306c0-.032-.016-.048-.016-.08a5.22 5.22 0 0 0-.688-1.406 4.883 4.883 0 0 0-1.088-1.135 5.207 5.207 0 0 0-1.04-.608 2.82 2.82 0 0 0 .464-.383 4.2 4.2 0 0 0 .624-.784 3.624 3.624 0 0 0 .528-1.934 3.71 3.71 0 0 0-.288-1.47 3.799 3.799 0 0 0-.816-1.199 3.845 3.845 0 0 0-1.2-.8 3.72 3.72 0 0 0-1.472-.287 3.72 3.72 0 0 0-1.472.288 3.631 3.631 0 0 0-1.2.815 3.84 3.84 0 0 0-.8 1.199 3.71 3.71 0 0 0-.288 1.47c0 .352.048.688.144 1.007.096.336.224.64.4.927.16.288.384.544.624.784.144.144.304.271.48.383a5.12 5.12 0 0 0-1.04.624c-.416.32-.784.703-1.088 1.119a4.999 4.999 0 0 0-.688 1.406c-.016.032-.016.064-.016.08C1.776 11.636.992 9.91.992 7.992.992 4.14 4.144.991 8 .991s7.008 3.149 7.008 7.001a6.96 6.96 0 0 1-2.032 4.907z"/></svg>
        </div>
      </div>
      <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
        <template v-if="userState.permission_level !== 'none'">
          <li><router-link to="/prof">Profile</router-link></li>
          <li><router-link to="/sett">Settings</router-link></li>
          <li><a @click="logout">Logout</a></li>
        </template>
        <template v-else>
          <li><router-link to="/login">Login</router-link></li>
          <li><router-link to="/signup">Sign Up</router-link></li>
        </template>
      </ul>
    </div>
  </div>
    <main>
      <router-view />
    </main>
</template>

<style>
@import "tailwindcss";
@plugin "daisyui";
</style>