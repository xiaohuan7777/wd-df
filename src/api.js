// API 模块 - 调用 EdgeOne Pages Edge Function
// Cookie 存储在浏览器 localStorage，每次请求带上

const API_BASE = '/api'

function getCookie() {
  return localStorage.getItem('xiaohuan_cookie') || ''
}

export function setCookie(val) {
  localStorage.setItem('xiaohuan_cookie', val)
}

export function hasCookie() {
  return !!getCookie()
}

export async function api(action, opts = {}) {
  const { method = 'GET', body, params = {} } = opts
  const url = new URL(`${API_BASE}/${action}`, window.location.href)
  const cookie = getCookie()
  if (cookie) url.searchParams.set('cookie', cookie)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const fetchOpts = { method }
  if (body) {
    fetchOpts.headers = { 'Content-Type': 'application/json' }
    if (cookie) fetchOpts.body = JSON.stringify({ ...body, cookie })
    else fetchOpts.body = JSON.stringify(body)
  }
  const r = await fetch(url.toString(), fetchOpts)
  return r.json()
}
