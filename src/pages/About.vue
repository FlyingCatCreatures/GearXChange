<script lang="ts" setup>
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";

// For SQL query box
const queryText = ref("");
const commitQuery = async () => {
  if (!queryText.value.trim()) return;
  try {
    await invoke("execute_query", { query: queryText.value });
  } catch (e) {
    console.error(e);
  }
};
</script>

<template>
  <div>
    <h2>About Page</h2>
    <p>This is a Tauri + Vue + TypeScript app.</p>
    <!-- SQL Query Box for Development/Testing -->
    <div class="query-box">
      <input
        v-model="queryText"
        class="query-input"
        type="text"
        placeholder="Enter SQL query..."
      />
      <button class="commit-btn" @click="commitQuery">Commit</button>
    </div>
  </div>
</template>