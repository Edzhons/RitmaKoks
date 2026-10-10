import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'

import App from './App.vue'
import AboutView from './views/AboutView.vue'
import HomeView from './views/HomeView.vue'
import LibraryView from './views/LibraryView.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: HomeView },
      { path: '/library', name: 'library', component: LibraryView },
      { path: '/about', name: 'about', component: AboutView },
    ],
  })
}

async function mountApp() {
  const router = createTestRouter()
  await router.push('/')
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [createPinia(), router],
    },
  })

  await flushPromises()

  return { wrapper, router }
}

describe('application shell', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-bs-theme')
  })

  it('shows the Latvian brand, accessible navigation, and rhythm-first dashboard', async () => {
    const { wrapper } = await mountApp()

    expect(wrapper.get('.brand-name').text()).toBe('RitmaKoks')
    expect(wrapper.get('nav[aria-label="Galvenā navigācija"]').text()).toContain('Bibliotēka')
    expect(wrapper.get('#hero-title').text()).toContain('Sāc ar ritmu.')
    expect(wrapper.get('.studio-card--featured h3').text()).toBe('Ritma studija')
    expect(wrapper.get('.studio-card--featured .studio-status').text()).toBe(
      'RitmaKoka galvenā sadaļa',
    )
    expect(wrapper.findAll('.studio-card')).toHaveLength(3)
  })

  it('switches and remembers the selected color theme', async () => {
    const { wrapper } = await mountApp()
    const themeButton = wrapper.get('[data-testid="theme-toggle"]')

    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')
    expect(themeButton.attributes('aria-label')).toBe('Ieslēgt tumšo režīmu')

    await themeButton.trigger('click')

    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')
    expect(localStorage.getItem('ritmakoks-theme')).toBe('dark')
    expect(themeButton.attributes('aria-label')).toBe('Ieslēgt gaišo režīmu')
  })

  it('navigates to the honest library placeholder', async () => {
    const { wrapper, router } = await mountApp()

    await router.push('/library')
    await flushPromises()

    expect(wrapper.get('#library-empty-title').text()).toBe('Bibliotēka vēl top')
    expect(wrapper.get('.nav-link.active').text()).toBe('Bibliotēka')
  })

  it('takes the header action to the studios section from other pages', async () => {
    const { wrapper, router } = await mountApp()

    await router.push('/library')
    await flushPromises()
    await wrapper.get('.nav-cta').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/#studios')
    expect(wrapper.find('#studios').exists()).toBe(true)
  })

  it('collapses and expands the mobile navigation accessibly', async () => {
    const { wrapper } = await mountApp()
    const menuButton = wrapper.get('.mobile-menu-toggle')

    expect(menuButton.attributes('aria-expanded')).toBe('false')
    expect(menuButton.attributes('aria-label')).toBe('Atvērt navigācijas izvēlni')

    await menuButton.trigger('click')

    expect(menuButton.attributes('aria-expanded')).toBe('true')
    expect(menuButton.attributes('aria-label')).toBe('Aizvērt navigācijas izvēlni')
    expect(wrapper.get('#primary-navigation').classes()).toContain('show')
  })
})
