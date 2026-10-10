import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const storageKey = 'ritmakoks-theme'

function getInitialTheme() {
  const preference = localStorage.getItem(storageKey)

  if (preference === 'light' || preference === 'dark') {
    return preference
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(getInitialTheme())
  const isDark = computed(() => theme.value === 'dark')

  function applyTheme() {
    document.documentElement.setAttribute('data-bs-theme', theme.value)
    localStorage.setItem(storageKey, theme.value)
  }

  function toggleTheme() {
    theme.value = isDark.value ? 'light' : 'dark'
    applyTheme()
  }

  document.documentElement.setAttribute('data-bs-theme', theme.value)

  return { theme, isDark, toggleTheme }
})
