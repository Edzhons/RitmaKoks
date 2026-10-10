<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useThemeStore } from './stores/theme'

const theme = useThemeStore()
const menuOpen = ref(false)
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">Skip to content</a>

    <header class="site-header">
      <nav class="navbar navbar-expand-lg site-navbar" aria-label="Main navigation">
        <div class="container site-container">
          <RouterLink class="navbar-brand brand-lockup" to="/" @click="menuOpen = false">
            <span class="brand-mark" aria-hidden="true">
              <i class="bi bi-music-note-beamed"></i>
            </span>
            <span class="brand-copy">
              <span class="brand-name">RitmaKoks</span>
              <span class="brand-tagline">A little more music, every day</span>
            </span>
          </RouterLink>

          <button
            class="navbar-toggler mobile-menu-toggle"
            type="button"
            :aria-expanded="menuOpen"
            aria-controls="primary-navigation"
            :aria-label="menuOpen ? 'Close navigation menu' : 'Open navigation menu'"
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
                Home
              </RouterLink>
              <RouterLink
                class="nav-link"
                to="/library"
                active-class="active"
                @click="menuOpen = false"
              >
                Library
              </RouterLink>
              <RouterLink
                class="nav-link"
                to="/about"
                active-class="active"
                @click="menuOpen = false"
              >
                About
              </RouterLink>
            </div>

            <div class="navbar-actions">
              <button
                class="theme-toggle"
                type="button"
                data-testid="theme-toggle"
                :aria-label="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                :title="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
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
                Start exploring
              </RouterLink>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <main id="main-content" class="site-main">
      <RouterView />
    </main>

    <footer class="site-footer">
      <div class="container site-container footer-content">
        <RouterLink class="footer-brand" to="/">
          <i class="bi bi-music-note-list" aria-hidden="true"></i>
          RitmaKoks
        </RouterLink>
        <p>Made for curious ears and creative minds.</p>
        <span class="footer-note">A good place to begin.</span>
      </div>
    </footer>
  </div>
</template>
