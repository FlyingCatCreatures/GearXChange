<template>
<div class="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center pointer-events-none">
<div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl relative pointer-events-auto">
<div class="card-body">
  <form @submit.prevent="handleSignup" class="space-y-4">
    <div>
      <label class="floating-label">
        <span>Email</span>
        <input
            v-model="email"
            type="text"
            class="input"
            required
            placeholder="Email"
        />
        </label>
    </div>
    <div>
        <label class="floating-label">
        <span>password</span>
        <input
            v-model="password"
            type="password"
            required
            placeholder="Password"
            class="input"
        />
      </label>
    </div>
    <button type="submit" :disabled="loading" class="btn">
      {{ loading ? 'Creating account...' : 'Sign up' }}
    </button>
    <p v-if="error" class="text-error whitespace-pre-line">{{ error }}</p>
        <p class="text-sm">
      Want to login instead?
      <NuxtLink to="/identity/login" class="text-accent">Login</NuxtLink>
    </p>
  </form>
</div>
</div>
</div>
</template>

<script setup lang="ts">
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

import { z } from "zod/v4"; 
const User = z.object({ 
  email: z.email(),
  password: z.string().min(8)
});

async function handleSignup() {
  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/signup', {
      method: 'POST',
      body: User.parse({ email: email.value, password: password.value }),
    })

    // optional: auto-login or redirect
    navigateTo('/identity/login')
  } catch (err: any) {
    if(err instanceof z.ZodError){
        let errmsg = ""
        for(let i=0; i<err.issues.length;i++){
            if(i!=0) errmsg+="\n"
            errmsg+=err.issues[i].message 
        }
        error.value = errmsg
    }
    else{
        error.value = err?.data?.message ?? 'Signup failed'
    }
  } finally {
    loading.value = false
  }
}
</script>