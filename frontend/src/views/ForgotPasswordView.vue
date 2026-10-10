<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const email = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    const result = await auth.requestPasswordReset(email.value)
    success.value = result.message
  } catch (requestError) {
    error.value = requestError.errors?.email?.[0] || requestError.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="container site-container auth-page">
    <div class="auth-card">
      <p class="eyebrow">Konta atjaunošana</p>
      <h1>Aizmirsāt paroli?</h1>
      <p class="text-body-secondary">
        Ievadiet konta e-pasta adresi. Ja konts eksistē, nosūtīsim paroles atjaunošanas saiti.
      </p>
      <div v-if="success" class="alert alert-success" role="status">{{ success }}</div>
      <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
      <form @submit.prevent="submit">
        <label class="form-label" for="forgot-email">E-pasta adrese</label>
        <input
          id="forgot-email"
          v-model="email"
          class="form-control mb-3"
          type="email"
          autocomplete="email"
          required
        />
        <button class="btn btn-primary w-100" type="submit" :disabled="loading">
          {{ loading ? 'Nosūta…' : 'Nosūtīt atjaunošanas saiti' }}
        </button>
      </form>
      <p class="auth-links"><RouterLink to="/login">Atgriezties pie pieslēgšanās</RouterLink></p>
    </div>
  </section>
</template>
