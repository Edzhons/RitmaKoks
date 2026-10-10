<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const form = ref({
  token: typeof route.query.token === 'string' ? route.query.token : '',
  email: typeof route.query.email === 'string' ? route.query.email : '',
  password: '',
  password_confirmation: '',
})
const error = ref('')
const success = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    const result = await auth.resetPassword(form.value)
    success.value = result.message
    setTimeout(() => router.push({ name: 'login' }), 1500)
  } catch (requestError) {
    error.value =
      requestError.errors?.password?.[0] || requestError.errors?.email?.[0] || requestError.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="container site-container auth-page">
    <div class="auth-card">
      <p class="eyebrow">Konta atjaunošana</p>
      <h1>Izvēlieties jaunu paroli</h1>
      <div v-if="success" class="alert alert-success" role="status">{{ success }}</div>
      <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label class="form-label" for="reset-email">E-pasta adrese</label>
          <input
            id="reset-email"
            v-model="form.email"
            class="form-control"
            type="email"
            autocomplete="email"
            required
          />
        </div>
        <div class="mb-3">
          <label class="form-label" for="reset-password">Jaunā parole</label>
          <input
            id="reset-password"
            v-model="form.password"
            class="form-control"
            type="password"
            autocomplete="new-password"
            minlength="12"
            required
          />
        </div>
        <div class="mb-3">
          <label class="form-label" for="reset-confirmation">Apstiprini paroli</label>
          <input
            id="reset-confirmation"
            v-model="form.password_confirmation"
            class="form-control"
            type="password"
            autocomplete="new-password"
            minlength="12"
            required
          />
        </div>
        <button class="btn btn-primary w-100" type="submit" :disabled="loading">
          {{ loading ? 'Atjauno…' : 'Atjaunot paroli' }}
        </button>
      </form>
    </div>
  </section>
</template>
