<script setup lang="ts">
import { ref, onMounted} from 'vue';
import { invoke } from '@tauri-apps/api/core';
import Login from '@components/Login.vue';
import Signup from './components/Signup.vue';
const userState = ref({ username: '', permission_level: 'none' });
const theme = ref('light')



async function fetchUserState() {
  try {
    const state = await invoke('get_user_state');
    userState.value = state as { username: string; permission_level: string };
  } catch (error) {
    console.error('Failed to fetch user state:', error);
  }
}

function setTheme(newTheme: string) {
  theme.value = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme); 
}

function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark');
}

onMounted(() => {
  fetchUserState();
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  } else {
    setTheme('light');
  }
});

type OverlayType = 'None' | 'Login' | 'Signup';
const activeOverlay = ref<OverlayType>('None');

function showOverlay(type: OverlayType) {
  activeOverlay.value = type;
}

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
  <div class="navbar bg-base-100 shadow-sm fixed top-0 left-0 w-full z-50">
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
    
    <div class="flex gap-2">
      <label class="swap swap-rotate">
        <!-- this hidden checkbox controls the state -->
        <input type="checkbox" class="theme-controller" :checked="theme === 'dark'" @change="toggleTheme" />

        <!-- sun icon -->
        <svg
          class="swap-off h-10 w-10 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24">
          <path
            d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
        </svg>

        <!-- moon icon -->
        <svg
          class="swap-on h-10 w-10 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24">
          <path
            d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
        </svg>
      </label>
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
            <li><a @click="showOverlay('Login')">Login</a></li>
            <li><a @click="showOverlay('Signup')">Sign Up</a></li>
          </template>
        </ul>
      </div>
    </div>
  </div>
    <main>
      <div class="min-h-16"></div>
      <router-view />
      <Login v-if="activeOverlay === 'Login'" @close="showOverlay('None'); fetchUserState" />
      <Signup v-if="activeOverlay === 'Signup'" @close="showOverlay('None')" @show-login="showOverlay('Login')"/>
    </main>
</template>

<style>
@import "tailwindcss";
@plugin "daisyui";
</style>