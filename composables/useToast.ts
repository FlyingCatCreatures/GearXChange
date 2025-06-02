const toastMessage = ref('')
const showToast = ref(false)
let toastTimeout: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function triggerToast(message: string) {
    toastMessage.value = message
    showToast.value = true
    if (toastTimeout) clearTimeout(toastTimeout)
    toastTimeout = setTimeout(() => {
      showToast.value = false
      toastMessage.value = ''
    }, 2500)
  }

  return {
    toastMessage,
    showToast,
    triggerToast
  }
}
