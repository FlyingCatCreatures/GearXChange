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

<style scoped>
.query-box {
  display: flex;
  align-items: center;
  margin: 1.5rem auto 0 auto;
  max-width: 600px;
  gap: 0.5rem;
}
.query-input {
  flex: 1;
  padding: 0.6em 1em;
  border: 1px solid #bbb;
  border-radius: 6px;
  font-size: 1em;
}
.commit-btn {
  background: #24c8db;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.6em 1.5em;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.commit-btn:hover {
  background: #1ba7b8;
}
</style>