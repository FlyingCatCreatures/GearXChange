<template>
  <form @submit.prevent="handleSignup" class="space-y-4">
    <div>
      <label>Email</label>
      <input v-model="email" type="email" required class="input" />
    </div>
    <div>
      <label>Password</label>
      <input v-model="password" type="password" required class="input" />
    </div>
    <button type="submit" :disabled="loading" class="btn">
      {{ loading ? 'Creating account...' : 'Sign up' }}
    </button>
    <p v-if="error" class="text-error">{{ error }}</p>
        <p class="text-sm">
      Want to login instead?
      <NuxtLink to="/identity/login" class="text-accent">Login</NuxtLink>
    </p>
  </form>
</template>

<script setup lang="ts">
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleSignup() {
  loading.value = true
  error.value = ''

  try {
    const res = await $fetch('/api/signup', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })

    // optional: auto-login or redirect
    navigateTo('/')
  } catch (err: any) {
    error.value = err?.data?.message ?? 'Signup failed'
  } finally {
    loading.value = false
  }
}
</script>
