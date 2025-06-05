export async function useUser() {
    const user = useState('user', () => null)
  
    try {
      const data = await $fetch('/api/me', { credentials: 'include' })
      user.value = data
    } catch {
      user.value = null
    }

  return user
}
