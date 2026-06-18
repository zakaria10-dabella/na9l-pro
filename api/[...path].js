const DEFAULT_BACKEND_URL = 'https://na9l-pro-api.onrender.com/api'

function backendBaseUrl() {
  return (process.env.BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, '')
}

function requestPath(queryPath) {
  if (Array.isArray(queryPath)) return queryPath.join('/')
  return queryPath || ''
}

export default async function handler(request, response) {
  const path = requestPath(request.query.path)
  const query = new URLSearchParams(request.query)
  query.delete('path')

  const target = `${backendBaseUrl()}/${path}${query.toString() ? `?${query}` : ''}`
  const headers = { ...request.headers }

  delete headers.host
  delete headers['x-forwarded-host']
  delete headers['x-forwarded-proto']
  delete headers['content-length']

  try {
    const hasBody = !['GET', 'HEAD'].includes(request.method)
    const body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body)
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody && request.body ? body : undefined,
    })

    const contentType = upstream.headers.get('content-type') || 'application/json'
    const body = await upstream.text()

    response.status(upstream.status)
    response.setHeader('content-type', contentType)
    response.send(body)
  } catch (error) {
    response.status(502).json({
      message: 'Backend not connected. Deploy the Laravel API and set BACKEND_URL in Vercel.',
      detail: error.message,
    })
  }
}
