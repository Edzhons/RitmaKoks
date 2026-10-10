import { ref } from 'vue'

import { apiRequest } from '../services/api'

export function useCrudResource(endpoint) {
  const items = ref([])
  const meta = ref({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  })
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  const validationErrors = ref({})
  let lastQuery = null
  let listingDeleted = false

  async function perform(operation, busyState) {
    error.value = null
    validationErrors.value = {}
    busyState.value = true

    try {
      return await operation()
    } catch (requestError) {
      error.value = requestError.message || 'Pieprasījumu neizdevās izpildīt.'
      validationErrors.value = requestError.errors || {}
      throw requestError
    } finally {
      busyState.value = false
    }
  }

  async function reloadAfterChange() {
    if (lastQuery === null) return
    const query = { ...lastQuery }
    let result = await apiRequest(listingDeleted ? `${endpoint}/trashed` : endpoint, {
      query,
    })
    const currentPage = Number(query.page || 1)
    const lastPage = Math.max(1, Number(result.meta.last_page || 1))

    if (currentPage > lastPage) {
      lastQuery = { ...lastQuery, page: lastPage }
      result = await apiRequest(listingDeleted ? `${endpoint}/trashed` : endpoint, {
        query: { ...lastQuery },
      })
    }

    items.value = result.data
    meta.value = result.meta
  }

  async function list(query = {}) {
    lastQuery = { ...query }
    listingDeleted = false

    return perform(async () => {
      const result = await apiRequest(endpoint, { query: lastQuery })
      items.value = result.data
      meta.value = result.meta
      return result
    }, loading)
  }

  async function trashed(query = {}) {
    lastQuery = { ...query }
    listingDeleted = true

    return perform(async () => {
      const result = await apiRequest(`${endpoint}/trashed`, { query: lastQuery })
      items.value = result.data
      meta.value = result.meta
      return result
    }, loading)
  }

  async function create(attributes) {
    return perform(async () => {
      const result = await apiRequest(endpoint, { method: 'POST', body: attributes })
      await reloadAfterChange()
      return result.data
    }, saving)
  }

  async function update(id, attributes) {
    return perform(async () => {
      const result = await apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: attributes,
      })
      await reloadAfterChange()
      return result.data
    }, saving)
  }

  async function remove(id) {
    return perform(async () => {
      const result = await apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      await reloadAfterChange()
      return result
    }, saving)
  }

  async function restore(id) {
    return perform(async () => {
      const result = await apiRequest(`${endpoint}/${encodeURIComponent(id)}/restore`, {
        method: 'POST',
      })
      await reloadAfterChange()
      return result.data
    }, saving)
  }

  return {
    items,
    meta,
    loading,
    saving,
    error,
    validationErrors,
    list,
    trashed,
    create,
    update,
    remove,
    restore,
  }
}
