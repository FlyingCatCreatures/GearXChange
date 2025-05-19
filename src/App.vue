<script setup lang="ts">
</script>

<template>
    <div>
  <nav class="navbar">
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>
    <router-link to="/login">Login</router-link>
    <span style="flex:1"></span>
    <img src="@assets/account.svg" alt="Account" class="account-icon" style="height:24px; vertical-align:middle;" />
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

.account-icon {
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