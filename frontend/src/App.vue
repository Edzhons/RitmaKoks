<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'

const theme = useThemeStore()
const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

async function signOut() {
  try {
    await auth.logout()
    await router.push({ name: 'home' })
  } catch (error) {
    auth.error = error.message
  }
}
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">Pāriet uz saturu</a>

    <header class="site-header">
      <nav class="navbar navbar-expand-lg site-navbar" aria-label="Galvenā navigācija">
        <div class="container site-container">
          <RouterLink class="navbar-brand brand-lockup" to="/" @click="menuOpen = false">
            <span class="brand-mark" aria-hidden="true">
              <i class="bi bi-music-note-beamed"></i>
            </span>
            <span class="brand-copy">
              <span class="brand-name">RitmaKoks</span>
              <span class="brand-tagline">Mūzika sākas ar ritmu</span>
            </span>
          </RouterLink>

          <button
            class="navbar-toggler mobile-menu-toggle"
            type="button"
            :aria-expanded="menuOpen"
            aria-controls="primary-navigation"
            :aria-label="menuOpen ? 'Aizvērt navigācijas izvēlni' : 'Atvērt navigācijas izvēlni'"
            @click="menuOpen = !menuOpen"
          >
            <i :class="menuOpen ? 'bi bi-x-lg' : 'bi bi-list'" aria-hidden="true"></i>
          </button>

          <div id="primary-navigation" class="collapse navbar-collapse" :class="{ show: menuOpen }">
            <div class="navbar-nav site-nav-links">
              <RouterLink
                class="nav-link"
                to="/"
                exact-active-class="active"
                @click="menuOpen = false"
              >
                Sākums
              </RouterLink>
              <RouterLink
                class="nav-link"
                to="/library"
                active-class="active"
                @click="menuOpen = false"
              >
                Bibliotēka
              </RouterLink>
              <RouterLink
                class="nav-link"
                to="/about"
                active-class="active"
                @click="menuOpen = false"
              >
                Par projektu
              </RouterLink>
            </div>

            <div class="navbar-actions">
              <button
                class="theme-toggle"
                type="button"
                data-testid="theme-toggle"
                :aria-label="theme.isDark ? 'Ieslēgt gaišo režīmu' : 'Ieslēgt tumšo režīmu'"
                :title="theme.isDark ? 'Ieslēgt gaišo režīmu' : 'Ieslēgt tumšo režīmu'"
                @click="theme.toggleTheme"
              >
                <i
                  :class="theme.isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'"
                  aria-hidden="true"
                ></i>
              </button>
              <RouterLink
                class="btn btn-primary nav-cta"
                :to="{ name: 'home', hash: '#studios' }"
                @click="menuOpen = false"
              >
                Iepazīt ritma studiju
              </RouterLink>
              <section class="account-panel" aria-label="Lietotāja konts">
                <template v-if="auth.isAuthenticated">
                  <span class="account-avatar" aria-hidden="true">
                    {{ auth.user.name.charAt(0).toLocaleUpperCase('lv') }}
                  </span>
                  <span class="account-details">
                    <span class="account-caption">Pieslēdzies kā</span>
                    <span class="account-name">{{ auth.user.name }}</span>
                  </span>
                  <button
                    class="account-action"
                    type="button"
                    data-testid="account-logout"
                    @click="signOut"
                  >
                    Izrakstīties
                  </button>
                </template>
                <template v-else>
                  <span class="account-caption">Mans konts</span>
                  <RouterLink class="account-login" to="/login" @click="menuOpen = false">
                    Pieteikties
                  </RouterLink>
                  <RouterLink class="account-register" to="/register" @click="menuOpen = false">
                    Reģistrēties
                  </RouterLink>
                </template>
              </section>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <main id="main-content" class="site-main">
      <div v-if="auth.error" class="container site-container pt-3" role="status">
        <div class="alert alert-warning">{{ auth.error }}</div>
      </div>
      <RouterView />
    </main>

    <footer class="site-footer">
      <div class="container site-container footer-content">
        <RouterLink class="footer-brand" to="/">
          <i class="bi bi-music-note-list" aria-hidden="true"></i>
          RitmaKoks
        </RouterLink>
        <p>Radīts zinātkārām ausīm un radošiem prātiem.</p>
        <span class="footer-note">Skaists sākums mūzikai.</span>
      </div>
    </footer>
  </div>
</template>
