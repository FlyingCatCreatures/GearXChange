<template>
  <form @submit.prevent="handleLogin" class="space-y-4">
    <div>
      <label>Email</label>
      <input v-model="email" type="email" required class="input" />
    </div>
    <div>
      <label>Password</label>
      <input v-model="password" type="password" required class="input" />
    </div>
    <button type="submit" :disabled="loading" class="btn">
      {{ loading ? 'Logging in...' : 'Login' }}
    </button>
    <p v-if="error" class="text-error">{{ error }}</p>
    <p class="text-sm">
      Don't have an account?
      <NuxtLink to="/identity/register" class="text-accent">Register</NuxtLink>
    </p>
  </form>
</template>

<script setup lang="ts">
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const res = await $fetch('/api/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })

    const user = useUser()

    // Show toast after successful login
    const { triggerToast } = useToast()
    triggerToast('Logged in successfully')

    // redirect on success
    navigateTo('/')
  } catch (err: any) {
    error.value = err?.data?.message ?? 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>