const toastMessage = ref("");
const showToast = ref(false);
let toastTimeout: ReturnType<typeof setTimeout> | null = null;

export function useToast() {
  function triggerToast(message: string) {
    toastMessage.value = message;
    showToast.value = true;
    if (toastTimeout) clearTimeout(toastTimeout); // Remove previous toast if it hasn't yet dissapeared
    toastTimeout = setTimeout(() => {
      showToast.value = false;
      toastMessage.value = "";
    }, 2500); // Display toast for 2,5 seconds
  }

  return {
    toastMessage,
    showToast,
    triggerToast,
  };
}
