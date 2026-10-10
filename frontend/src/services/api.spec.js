import { afterEach, describe, expect, it, vi } from 'vitest'

import { apiRequest, ApiError, prepareCsrfCookie } from './api'

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

  it('raises a clear API error when the CSRF endpoint fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 503 }))

    await expect(prepareCsrfCookie()).rejects.toBeInstanceOf(ApiError)
  })
})
