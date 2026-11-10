const BASE = 'https://be6a16d2-ec69-44f3-b48a-9a2beea44b0f.cfargotunnel.com'
const OMADAC = 'cad8b84aedf4d1c772b56c6c29657127'
const CLIENT_ID = '404c1380bc2043648ca28d558c05564e'
const CLIENT_SECRET = '1a4ab0da45e9458ab71d4e5218ac87c5'

console.log('Testing permanent Cloudflare tunnel...')

try {
  const res = await fetch(BASE + '/openapi/authorize/token?grant_type=client_credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ omadacId: OMADAC, client_id: CLIENT_ID, client_secret: CLIENT_SECRET })
  })
  const text = await res.text()
  console.log('HTTP:', res.status)
  try {
    const data = JSON.parse(text)
    if (data.errorCode === 0) {
      console.log('✅ TUNNEL WORKING! Token:', data.result.accessToken.slice(0,20)+'...')
    } else {
      console.log('API Error:', data.errorCode, data.msg)
    }
  } catch {
    console.log('Response:', text.slice(0, 200))
  }
} catch(e) {
  console.error('Error:', e.message)
}
