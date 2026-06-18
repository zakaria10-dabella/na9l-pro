const defaultApiUrl = import.meta.env.PROD
  ? '/api'
  : 'http://127.0.0.1:8000/api'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const pointsToLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/.test(configuredApiUrl || '')

export const API_BASE_URL = configuredApiUrl && !(import.meta.env.PROD && pointsToLocalhost)
  ? configuredApiUrl
  : defaultApiUrl

export function apiFetch(path, options = {}) {
  return fetch(`${API_BASE_URL}${path}`, options)
}
