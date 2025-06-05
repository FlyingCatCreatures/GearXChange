<script lang="ts" setup>
import { ref } from 'vue'

const user = useUser()
const form = ref({
  email: user.value && typeof user.value === 'object' && 'email' in user.value ? (user.value as any).email : '',
  password: '',
  confirm: '',
  location: user.value && typeof user.value === 'object' && 'location' in user.value ? (user.value as any).location : '',
  language: user.value && typeof user.value === 'object' && 'language' in user.value ? (user.value as any).language : 'en',
  name: user.value && typeof user.value === 'object' && ('name' in user.value || 'fullName' in user.value)
    ? (user.value as any).name || (user.value as any).fullName : '',
})
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const showConfirm = ref(false)
const pendingSubmit = ref(false)

async function saveProfile() {
  errorMsg.value = ''
  successMsg.value = ''
  if (form.value.password && form.value.password !== form.value.confirm) {
    errorMsg.value = 'Passwords do not match.'
    return
  }
  loading.value = true
  try {
    const res = await $fetch<{ success?: boolean; message?: string }>('/api/update-credentials', {
      method: 'POST',
      body: {
        email: form.value.email,
        password: form.value.password || undefined,
      },
    })
    if (res && res.success) {
      successMsg.value = 'Profile updated successfully.'
      form.value.password = ''
      form.value.confirm = ''
    } else {
      errorMsg.value = res?.message || 'Failed to update profile.'
    }
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Failed to update profile.'
  } finally {
    loading.value = false
  }
}

function onSubmit() {
  showConfirm.value = true
  pendingSubmit.value = true
}

function confirmSaveProfile() {
  showConfirm.value = false
  pendingSubmit.value = false
  saveProfile()
}

function cancelSaveProfile() {
  showConfirm.value = false
  pendingSubmit.value = false
}
</script>

<template>
  <div class="profile-page max-w-xl mx-auto py-10">
    <h1 class="text-3xl font-bold mb-6">Profile Settings</h1>
    <form class="space-y-10" @submit.prevent="onSubmit">
      <!-- Account Section -->
      <div class="border-b pb-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Account</h2>
        <div class="mb-4">
          <label class="block mb-1 font-semibold" for="name">Name</label>
          <input id="name" v-model="form.name" type="text" class="input input-bordered w-full" placeholder="Your full name" />
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-semibold" for="email">Email</label>
          <input id="email" v-model="form.email" type="email" class="input input-bordered w-full" required />
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-semibold" for="password">New Password</label>
          <input id="password" v-model="form.password" type="password" class="input input-bordered w-full" placeholder="Leave blank to keep current password" />
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-semibold" for="confirm">Confirm New Password</label>
          <input id="confirm" v-model="form.confirm" type="password" class="input input-bordered w-full" placeholder="Repeat new password" />
        </div>
      </div>
      <!-- Preferences Section -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Other</h2>
        <div class="mb-4">
          <label class="block mb-1 font-semibold" for="language">Language</label>
          <select id="language" v-model="form.language" class="select select-bordered w-full">
            <option value="en">English</option>
            <option value="nl">Dutch</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <!-- Add more languages as needed -->
          </select>
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-semibold" for="location">Location</label>
          <input id="location" v-model="form.location" type="text" class="input input-bordered w-full" placeholder="Your city, region or country" />
        </div>
      </div>
      <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>
      <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>
      <button class="btn btn-primary w-full" :disabled="loading">
        <span v-if="loading" class="loading loading-spinner loading-xs mr-2"></span>
        Save Changes
      </button>
    </form>
    <!-- Confirmation Modal -->
    <div v-if="showConfirm" class="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div class="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h3 class="text-lg font-bold mb-4">Confirm Changes</h3>
        <p class="mb-6">Are you sure you want to save your changes?</p>
        <div class="flex justify-end gap-2">
          <button class="btn btn-ghost" @click="cancelSaveProfile">Cancel</button>
          <button class="btn btn-primary" @click="confirmSaveProfile">Yes, Save</button>
        </div>
      </div>
    </div>
  </div>
</template>