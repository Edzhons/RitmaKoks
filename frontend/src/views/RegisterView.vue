<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const form = ref({ name: '', email: '', password: '', password_confirmation: '' })
const errors = ref({})
const message = ref('')

async function submit() {
  errors.value = {}
  message.value = ''
  try {
    await auth.register(form.value)
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
      <p class="eyebrow">Pievienojies RitmaKokam</p>
      <h1>Izveidot kontu</h1>
      <p class="text-body-secondary">Konts palīdzēs turpmāk saglabāt tavus muzikālos darbus.</p>

      <div v-if="message" class="alert alert-danger" role="alert">{{ message }}</div>
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label class="form-label" for="register-name">Vārds</label>
          <input
            id="register-name"
            v-model="form.name"
            class="form-control"
            autocomplete="name"
            maxlength="255"
            required
          />
          <div v-if="errors.name" class="text-danger small mt-1">{{ errors.name[0] }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="register-email">E-pasta adrese</label>
          <input
            id="register-email"
            v-model="form.email"
            class="form-control"
            type="email"
            autocomplete="email"
            required
          />
          <div v-if="errors.email" class="text-danger small mt-1">{{ errors.email[0] }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="register-password">Parole (vismaz 12 rakstzīmes)</label>
          <input
            id="register-password"
            v-model="form.password"
            class="form-control"
            type="password"
            autocomplete="new-password"
            minlength="12"
            required
          />
          <div v-if="errors.password" class="text-danger small mt-1">{{ errors.password[0] }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="register-confirmation">Apstiprini paroli</label>
          <input
            id="register-confirmation"
            v-model="form.password_confirmation"
            class="form-control"
            type="password"
            autocomplete="new-password"
            minlength="12"
            required
          />
        </div>
        <button class="btn btn-primary w-100" type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Notiek reģistrācija…' : 'Reģistrēties' }}
        </button>
      </form>
      <p class="auth-links">Jau ir konts? <RouterLink to="/login">Pieslēdzies</RouterLink></p>
    </div>
  </section>
</template>
