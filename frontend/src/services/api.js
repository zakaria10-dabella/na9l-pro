export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export function apiFetch(path, options = {}) {
  return fetch(`${API_BASE_URL}${path}`, options)
}
