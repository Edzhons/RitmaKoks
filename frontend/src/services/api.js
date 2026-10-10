const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

function xsrfToken() {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='))

  return cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : null
}

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  const token = xsrfToken()

  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers['X-XSRF-TOKEN'] = token

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) return null

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(
      payload.message || 'Neizdevās sazināties ar serveri.',
      response.status,
      payload.errors || {},
    )
  }

  return payload
}

export async function prepareCsrfCookie() {
  const response = await fetch(`${apiBaseUrl}/sanctum/csrf-cookie`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new ApiError('Neizdevās sagatavot drošu savienojumu ar serveri.', response.status)
  }
}
