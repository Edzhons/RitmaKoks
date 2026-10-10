import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiRequest } from '../services/api'
import { useCrudResource } from './useCrudResource'

vi.mock('../services/api', () => ({
  apiRequest: vi.fn(),
}))

const page = {
  data: [{ id: 1, title: 'Ritms' }],
  meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
}

describe('useCrudResource', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads filtered and paginated collection data', async () => {
    apiRequest.mockResolvedValue(page)
    const resource = useCrudResource('/api/rhythm-exercises')

    await resource.list({ search: 'valsis', category_id: 2, page: 3 })

    expect(apiRequest).toHaveBeenCalledWith('/api/rhythm-exercises', {
      query: { search: 'valsis', category_id: 2, page: 3 },
    })
    expect(resource.items.value).toEqual(page.data)
    expect(resource.meta.value).toEqual(page.meta)
    expect(resource.loading.value).toBe(false)
  })

  it('keeps loading state active until an asynchronous list request completes', async () => {
    let resolveRequest
    apiRequest.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )
    const resource = useCrudResource('/api/rhythm-exercises')

    const pending = resource.list()

    expect(resource.loading.value).toBe(true)

    resolveRequest(page)
    await pending

    expect(resource.loading.value).toBe(false)
  })

  it('creates and updates items, then refreshes the active collection', async () => {
    apiRequest
      .mockResolvedValueOnce(page)
      .mockResolvedValueOnce({ data: { id: 2, title: 'Jauns ritms' } })
      .mockResolvedValueOnce(page)
      .mockResolvedValueOnce({ data: { id: 1, title: 'Mainīts ritms' } })
      .mockResolvedValueOnce(page)
    const resource = useCrudResource('/api/rhythm-exercises')
    await resource.list({ sort: 'title', direction: 'asc' })

    await resource.create({ title: 'Jauns ritms', content: {} })
    await resource.update(1, { title: 'Mainīts ritms' })

    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/rhythm-exercises', {
      method: 'POST',
      body: { title: 'Jauns ritms', content: {} },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(4, '/api/rhythm-exercises/1', {
      method: 'PATCH',
      body: { title: 'Mainīts ritms' },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(5, '/api/rhythm-exercises', {
      query: { sort: 'title', direction: 'asc' },
    })
  })

  it('reloads the active list after a soft delete', async () => {
    apiRequest
      .mockResolvedValueOnce(page)
      .mockResolvedValueOnce({ message: 'Dzēsts.' })
      .mockResolvedValueOnce({ ...page, data: [], meta: { ...page.meta, total: 0 } })
    const resource = useCrudResource('/api/rhythm-exercises')
    await resource.list({ search: 'valsis' })

    await resource.remove(1)

    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/rhythm-exercises/1', {
      method: 'DELETE',
    })
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/api/rhythm-exercises', {
      query: { search: 'valsis' },
    })
    expect(resource.items.value).toEqual([])
  })

  it('moves back to the last available page after removing the final item', async () => {
    const remainingPage = {
      data: [{ id: 2, title: 'Atlikušais ritms' }],
      meta: { current_page: 1, per_page: 1, total: 1, last_page: 1 },
    }
    apiRequest
      .mockResolvedValueOnce({ ...page, meta: { ...page.meta, current_page: 2, total: 2 } })
      .mockResolvedValueOnce({ message: 'Dzēsts.' })
      .mockResolvedValueOnce({
        ...page,
        data: [],
        meta: { current_page: 2, per_page: 1, total: 1, last_page: 1 },
      })
      .mockResolvedValueOnce(remainingPage)
    const resource = useCrudResource('/api/rhythm-exercises')
    await resource.list({ page: 2, per_page: 1 })

    await resource.remove(1)

    expect(apiRequest).toHaveBeenNthCalledWith(3, '/api/rhythm-exercises', {
      query: { page: 2, per_page: 1 },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(4, '/api/rhythm-exercises', {
      query: { page: 1, per_page: 1 },
    })
    expect(resource.items.value).toEqual(remainingPage.data)
    expect(resource.meta.value.current_page).toBe(1)
  })

  it('loads deleted items and reloads the deleted list after restoring', async () => {
    apiRequest
      .mockResolvedValueOnce(page)
      .mockResolvedValueOnce({ data: page.data[0] })
      .mockResolvedValueOnce({ ...page, data: [] })
    const resource = useCrudResource('/api/melody-compositions')

    await resource.trashed({ page: 2 })
    await resource.restore(1)

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/api/melody-compositions/trashed', {
      query: { page: 2 },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/melody-compositions/1/restore', {
      method: 'POST',
    })
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/api/melody-compositions/trashed', {
      query: { page: 2 },
    })
  })

  it('keeps validation errors visible and clears loading state after rejection', async () => {
    apiRequest.mockRejectedValueOnce({
      message: 'Dati nav derīgi.',
      errors: { title: ['Nosaukums ir obligāts.'] },
    })
    const resource = useCrudResource('/api/rhythm-exercises')

    await expect(resource.create({})).rejects.toMatchObject({ message: 'Dati nav derīgi.' })

    expect(resource.error.value).toBe('Dati nav derīgi.')
    expect(resource.validationErrors.value).toEqual({ title: ['Nosaukums ir obligāts.'] })
    expect(resource.saving.value).toBe(false)
  })
})
