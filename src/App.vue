<script setup lang="ts">
</script>

<template>
    <div>
  <nav class="navbar">
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>
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
}

.navbar a {
  color: white;
  margin-right: 10px;
  text-decoration: none;
}

.navbar a.router-link-active {
  font-weight: bold;
}

main {
  padding: 20px;
}
</style>