const BASE = 'https://pda-beginners-cargo-chat.trycloudflare.com'
const OMADAC = 'cad8b84aedf4d1c772b56c6c29657127'
const CLIENT_ID = '404c1380bc2043648ca28d558c05564e'
const CLIENT_SECRET = '1a4ab0da45e9458ab71d4e5218ac87c5'
const SITE = '6aed378574b7bc66367b3938'

console.log('Testing Omada API via Cloudflare Tunnel...')
console.log('URL:', BASE)

try {
  const res = await fetch(BASE + '/openapi/authorize/token?grant_type=client_credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ omadacId: OMADAC, client_id: CLIENT_ID, client_secret: CLIENT_SECRET })
  })

  const text = await res.text()
  console.log('HTTP Status:', res.status)
  console.log('Response:', text.substring(0, 300))

  const data = JSON.parse(text)
  if (data.errorCode === 0) {
    const token = data.result.accessToken
    console.log('\n✅ Authentication SUCCESS!')
    console.log('Token:', token.substring(0, 25) + '...')
    console.log('Expires in:', data.result.expiresIn, 'seconds')

    // Test get sites
    const sites = await fetch(BASE + `/openapi/v1/${OMADAC}/sites?pageSize=10&page=1`, {
      headers: { 'Authorization': 'AccessToken=' + token }
    }).then(r => r.json())
    console.log('\nSites:', JSON.stringify(sites?.result?.data?.map(s => ({id:s.siteId, name:s.name})), null, 2))

  } else {
    console.log('\n❌ Auth Error:', data.errorCode, data.msg)
  }
} catch (e) {
  console.error('\n❌ Error:', e.message)
}
