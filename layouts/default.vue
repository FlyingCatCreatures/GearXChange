<template>
  <div>
    <Navbar />
    <div class="mt-16"></div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { SyncUser } from "~/middleware/auth.global";

let intervalId: ReturnType<typeof setInterval>;

onMounted(() => {
  nextTick(() => {
    SyncUser();
    intervalId = setInterval(() => {
      SyncUser(); // Sync user state again periodically
    }, 1000 * 10); // 10 second delay between resyncs as we're attempting to have it desync rarely if ever
  });
});

onBeforeUnmount(() => {
  clearInterval(intervalId); // prevent potential memory leak
});
</script>
