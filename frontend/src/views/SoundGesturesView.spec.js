import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import SoundGesturesView from './SoundGesturesView.vue'
import { useAuthStore } from '../stores/auth'

const mocks = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  resolveApiUrl: vi.fn((path) => `http://localhost:8000${path}`),
  useCrudResource: vi.fn(),
}))

vi.mock('../services/api', () => ({
  apiRequest: mocks.apiRequest,
  resolveApiUrl: mocks.resolveApiUrl,
}))

vi.mock('../composables/useCrudResource', () => ({
  useCrudResource: mocks.useCrudResource,
}))

function setupResource() {
  const resource = {
    items: ref([]),
    meta: ref({ current_page: 1, per_page: 15, total: 0, last_page: 1 }),
    loading: ref(false),
    saving: ref(false),
    error: ref(null),
    validationErrors: ref({}),
    list: vi.fn().mockResolvedValue({ data: [], meta: {} }),
    trashed: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    restore: vi.fn(),
  }
  mocks.useCrudResource.mockReturnValue(resource)
  return resource
}

async function mountEditor({ authenticated = false } = {}) {
  const pinia = createPinia()
  const auth = useAuthStore(pinia)
  auth.initialized = true
  auth.user = authenticated
    ? { id: 1, name: 'Skolotāja', email: 'teacher@example.com', role: 'user' }
    : null

  const wrapper = mount(SoundGesturesView, {
    global: {
      plugins: [pinia],
      stubs: {
        RouterLink: { template: '<a><slot /></a>' },
      },
    },
  })

  await flushPromises()

  return { wrapper, resource: mocks.useCrudResource.mock.results.at(-1).value }
}

describe('SoundGesturesView', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    setupResource()
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:local-song'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('offers the separate gesture activity and requires a song before adding cues', async () => {
    const { wrapper } = await mountEditor()

    expect(wrapper.get('h1').text()).toBe('Skanošie žesti')
    expect(wrapper.findAll('.gesture-button')).toHaveLength(3)
    expect(wrapper.get('.gesture-button').element.disabled).toBe(true)
    expect(wrapper.get('.presentation-launch-button').element.disabled).toBe(true)
    expect(wrapper.get('.audio-empty').text()).toContain('Izvēlies dziesmu')
    expect(wrapper.text()).toContain('Mūzikas instrumentu')
  })

  it('records the selected gesture at the song playback time', async () => {
    const { wrapper } = await mountEditor()
    const file = new File(['audio'], 'dziesma.mp3', { type: 'audio/mpeg' })
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
    await input.trigger('change')
    await flushPromises()

    expect(wrapper.find('audio').exists()).toBe(true)
    expect(wrapper.get('[aria-label="Pievienot Kājiņa pie 00:00.00"]').element.disabled).toBe(false)
    const audio = wrapper.get('audio').element
    Object.defineProperty(audio, 'currentTime', { configurable: true, value: 12.345 })
    await wrapper.get('[aria-label="Pievienot Kājiņa pie 00:00.00"]').trigger('click')

    expect(wrapper.get('.current-gesture-card strong').text()).toBe('Kājiņa')
    expect(wrapper.get('.cue-time').text()).toBe('00:12.35')
    expect(wrapper.get('.cue-list-item-active').text()).toContain('Kājiņa')
  })

  it('starts presentation from the beginning and highlights the first gesture', async () => {
    const { wrapper } = await mountEditor()
    const file = new File(['audio'], 'dziesma.mp3', { type: 'audio/mpeg' })
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
    await input.trigger('change')
    await flushPromises()

    const launchButton = wrapper.get('.presentation-launch-button')
    expect(launchButton.element.disabled).toBe(true)

    await wrapper.get('[aria-label="Pievienot Plaukšķis pie 00:00.00"]').trigger('click')
    expect(launchButton.element.disabled).toBe(false)

    const audio = wrapper.get('audio').element
    vi.spyOn(audio, 'pause').mockImplementation(() => {})
    Object.defineProperty(audio, 'currentTime', {
      configurable: true,
      writable: true,
      value: 6.5,
    })
    audio.dispatchEvent(new Event('timeupdate'))
    await launchButton.trigger('click')

    expect(audio.currentTime).toBe(0)
    expect(wrapper.get('.presentation-overlay').exists()).toBe(true)
    expect(wrapper.get('.presentation-stage h3').text()).toBe('Plaukšķis')
    expect(wrapper.get('.presentation-emoji').text()).toBe('👏')
  })

  it('saves gesture cues and uploads a selected soundtrack as multipart data', async () => {
    const resource = setupResource()
    resource.create.mockResolvedValue({
      id: 42,
      title: 'Dziesmas žesti',
      content: { schemaVersion: 2, cues: [{ id: 'cue-1', at: 0, gesture: 'clap' }] },
    })
    mocks.apiRequest.mockResolvedValue({
      data: { id: 42, audio_url: '/api/rhythm-exercises/42/audio' },
    })
    const { wrapper } = await mountEditor({ authenticated: true })
    const file = new File(['audio'], 'dziesma.mp3', { type: 'audio/mpeg' })
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
    await input.trigger('change')
    await flushPromises()

    expect(wrapper.find('audio').exists()).toBe(true)
    await wrapper
      .get('input[placeholder="Piemēram, Ritms pavasara dziesmai"]')
      .setValue('Dziesmas žesti')
    await wrapper.get('.save-button').trigger('click')
    await flushPromises()

    expect(wrapper.find('.inline-error').exists()).toBe(false)
    expect(resource.create).toHaveBeenCalledWith({
      title: 'Dziesmas žesti',
      content: { schemaVersion: 2, cues: [] },
    })
    expect(mocks.apiRequest).toHaveBeenCalledWith('/api/rhythm-exercises/42/audio', {
      method: 'POST',
      body: expect.any(FormData),
    })
    const formData = mocks.apiRequest.mock.calls[0][1].body
    expect(formData.get('audio')).toBe(file)
    expect(mocks.resolveApiUrl).toHaveBeenCalledWith('/api/rhythm-exercises/42/audio')
    expect(wrapper.get('.inline-success').text()).toContain('Dziesmas žesti')
  })
})
