import { json } from './_shared.js'

export async function onRequest() {
  return json({ has_cookie: false })
}
