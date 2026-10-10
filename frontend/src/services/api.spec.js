import { afterEach, describe, expect, it, vi } from 'vitest'

import { apiRequest, ApiError, prepareCsrfCookie, resolveApiUrl } from './api'

describe('API service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.cookie = 'XSRF-TOKEN=; Max-Age=0'
  })

  it('sends same-site credentials, CSRF headers, JSON bodies, and encoded filters', async () => {
    document.cookie = 'XSRF-TOKEN=csrf%2Bvalue'
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await apiRequest('/api/rhythm-exercises', {
      method: 'POST',
      body: { title: 'Ritms' },
      query: { search: '2/4 takts', category_id: 3, ignored: '' },
    })

    const [url, options] = fetch.mock.calls[0]
    const requestUrl = new URL(url)
    expect(requestUrl.pathname).toBe('/api/rhythm-exercises')
    expect(requestUrl.searchParams.get('search')).toBe('2/4 takts')
    expect(requestUrl.searchParams.get('category_id')).toBe('3')
    expect(requestUrl.searchParams.has('ignored')).toBe(false)
    expect(options.credentials).toBe('include')
    expect(options.headers['X-XSRF-TOKEN']).toBe('csrf+value')
    expect(JSON.parse(options.body)).toEqual({ title: 'Ritms' })
  })

  it('exposes API validation errors without hiding the HTTP status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Dati nav derīgi.',
          errors: { title: ['Nosaukums ir obligāts.'] },
        }),
        { status: 422 },
      ),
    )

    await expect(apiRequest('/api/rhythm-exercises', { method: 'POST', body: {} })).rejects.toEqual(
      expect.objectContaining({
        name: 'ApiError',
        status: 422,
        message: 'Dati nav derīgi.',
        errors: { title: ['Nosaukums ir obligāts.'] },
      }),
    )
  })

  it('checks the CSRF-cookie request result', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))

    await expect(prepareCsrfCookie()).resolves.toBeUndefined()
  })

  it('sends uploaded files as multipart form data without overriding the content type', async () => {
    document.cookie = 'XSRF-TOKEN=csrf-token'
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { audio_url: '/api/rhythm-exercises/1/audio' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const form = new FormData()
    form.append('audio', new File(['audio'], 'song.mp3', { type: 'audio/mpeg' }))

    await apiRequest('/api/rhythm-exercises/1/audio', { method: 'POST', body: form })

    const [, options] = fetch.mock.calls[0]
    expect(options.body).toBe(form)
    expect(options.credentials).toBe('include')
    expect(options.headers['X-XSRF-TOKEN']).toBe('csrf-token')
    expect(options.headers['Content-Type']).toBeUndefined()
  })

  it('resolves a protected audio API URL against the configured API origin', () => {
    expect(resolveApiUrl('/api/rhythm-exercises/1/audio')).toBe(
      'http://localhost:8000/api/rhythm-exercises/1/audio',
    )
  })

  it('raises a clear API error when the CSRF endpoint fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 503 }))

    await expect(prepareCsrfCookie()).rejects.toBeInstanceOf(ApiError)
  })
})
