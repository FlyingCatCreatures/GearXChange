<template>
    <div>
        <Navbar />
        <div class="mt-16"></div>
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
import { SyncUser } from '~/middleware/auth.global';

let intervalId: ReturnType<typeof setInterval>;

onMounted(() => {
  nextTick(() => {
    SyncUser(); 
    intervalId = setInterval(() => {
      SyncUser(); // Sync user state again periodically
    }, 100); 
  });
});

onBeforeUnmount(() => {
  clearInterval(intervalId); // prevent memory leaks
});
</script>