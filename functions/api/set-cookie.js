import { json } from './_shared.js'

export async function onRequest(context) {
  const { request } = context
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } })
  }
  try {
    const { cookie } = await request.json()
    if (!cookie) return json({ error: 'missing cookie' }, 400)
    const r = await fetch('http://www.wendasch.cn/pay/home', {
      headers: { 'Cookie': cookie, 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.38' },
    })
    const body = await r.text()
    const ok = r.status === 200 && !body.includes('weixin.qq.com') && body.length > 100
    return json({ ok: true, test_ok: ok, message: ok ? 'Cookie 有效！' : 'Cookie 测试失败' })
  } catch (e) {
    return json({ ok: false, message: e.message }, 400)
  }
}
