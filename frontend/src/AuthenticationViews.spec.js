import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'

import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'

async function mountView(component) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component }],
  })
  await router.push('/')

  return mount(component, {
    global: {
      plugins: [createPinia(), router],
    },
  })
}

describe('authentication pages', () => {
  it('renders Latvian sign-in fields and password recovery link', async () => {
    const wrapper = await mountView(LoginView)

    expect(wrapper.get('h1').text()).toBe('Pieslēgties')
    expect(wrapper.get('#login-email').attributes('autocomplete')).toBe('email')
    expect(wrapper.get('#login-password').attributes('autocomplete')).toBe('current-password')
    expect(wrapper.get('a[href="/password/forgot"]').text()).toBe('Aizmirsi paroli?')
  })

  it('only requests a name, email, and password during public registration', async () => {
    const wrapper = await mountView(RegisterView)

    expect(wrapper.get('h1').text()).toBe('Izveidot kontu')
    expect(wrapper.find('input[name="role"]').exists()).toBe(false)
    expect(wrapper.get('#register-password').attributes('minlength')).toBe('12')
    expect(wrapper.get('#register-confirmation').attributes('autocomplete')).toBe('new-password')
  })
})
