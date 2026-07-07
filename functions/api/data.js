import { fetchAllData, json } from './_shared.js'

export async function onRequest(context) {
  const { request } = context
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } })
  }
  const cookie = new URL(request.url).searchParams.get('cookie')
  if (!cookie) return json({ error: 'no_cookie' }, 401)
  return json(await fetchAllData(cookie))
}
