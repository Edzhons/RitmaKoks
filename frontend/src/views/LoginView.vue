<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const form = ref({ email: '', password: '', remember: false })
const errors = ref({})
const message = ref('')

async function submit() {
  errors.value = {}
  message.value = ''
  try {
    await auth.login(form.value)
    await router.push({ name: 'home' })
  } catch (error) {
    errors.value = error.errors || {}
    message.value = error.status === 422 ? '' : error.message
  }
}
</script>

<template>
  <section class="container site-container auth-page">
    <div class="auth-card">
      <p class="eyebrow">RitmaKoks konts</p>
      <h1>Pieslēgties</h1>
      <p class="text-body-secondary">Turpini savu ceļu mūzikas un ritma pasaulē.</p>

      <div v-if="message" class="alert alert-danger" role="alert">{{ message }}</div>
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label class="form-label" for="login-email">E-pasta adrese</label>
          <input
            id="login-email"
            v-model="form.email"
            class="form-control"
            type="email"
            autocomplete="email"
            required
          />
          <div v-if="errors.email" class="text-danger small mt-1">{{ errors.email[0] }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="login-password">Parole</label>
          <input
            id="login-password"
            v-model="form.password"
            class="form-control"
            type="password"
            autocomplete="current-password"
            required
          />
          <div v-if="errors.password" class="text-danger small mt-1">{{ errors.password[0] }}</div>
        </div>
        <div class="form-check mb-3">
          <input
            id="remember-me"
            v-model="form.remember"
            class="form-check-input"
            type="checkbox"
          />
          <label class="form-check-label" for="remember-me">Palikt pieslēgtam</label>
        </div>
        <button class="btn btn-primary w-100" type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Notiek pieslēgšanās…' : 'Pieteikties' }}
        </button>
      </form>
      <div class="auth-links">
        <RouterLink to="/password/forgot">Aizmirsi paroli?</RouterLink>
        <span>Vēl nav konta? <RouterLink to="/register">Reģistrējies</RouterLink></span>
      </div>
    </div>
  </section>
</template>
