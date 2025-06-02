import { useState, useAsyncData } from '#app'

export function useUser() {
  const user = useState('user', () => null)

  if (process.client && user.value === null) {
    useAsyncData('user', async () => {
      try {
        const data = await $fetch('/api/me')
        user.value = data
      } catch {
        user.value = null
      }
      return user.value
    })
  }

  return user
}
