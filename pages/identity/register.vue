<template>
<div class="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center pointer-events-none">
<div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl relative pointer-events-auto">
<div class="card-body">
  <form @submit.prevent="handleSignup" class="space-y-4">
        <div>
        <label class="floating-label">
        <span>Name</span>
        <input
            v-model="name"
            type="text"
            required
            placeholder="Name"
            class="input"
        />
      </label>
    </div>
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
    <div class="mb-2">
    <label class="label">
        <input type="checkbox" v-model="loginDirectly"  class="checkbox checkbox-accent" />
        Log in directly?
    </label>
    </div>

    <div>
    <button type="submit" :disabled="loading" class="btn">
        {{ loading ? 'Creating account...' : 'Sign up' }}
    </button>
    </div>
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
const loginDirectly = ref(true)
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const name = ref('')

import { z } from "zod/v4"; 
const User = z.object({ 
  email: z.email(),
  name: z.string(),
  password: z.string().min(8)
});

async function handleSignup() {
  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/signup', {
      method: 'POST',
      body: User.parse({ email: email.value, password: password.value, name: name.value}),
    })

    if(loginDirectly.value){
        try {
            await $fetch('/api/login', {
            method: 'POST',
            body: User.parse({email: email.value, password: password.value, name: name.value }),
            })

            useUser()

            // Show toast after successful login
            useToast().triggerToast('Logged in successfully')

            // redirect on success 
            navigateTo('/')
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
                error.value = err?.data?.message ?? 'Login failed'
            }
        } finally {
            loading.value = false
        }
    }
    navigateTo('/') // Go to home page after either logging in or signing up
    
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