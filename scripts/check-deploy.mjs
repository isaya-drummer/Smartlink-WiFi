const T = "REPLACE_WITH_CF_TOKEN"
const A = "REPLACE_WITH_CF_ACCOUNT_ID"
const DEPLOY_ID = "f0a60760-1261-4584-88c3-1e12702d3a73"

const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${A}/pages/projects/smartlink-wifi/deployments/${DEPLOY_ID}/history/logs?size=1000`, {
  headers: { "Authorization": `Bearer ${T}` }
}).then(r => r.json())

const lines = r.result?.data || []
// Get lines from 950 onwards (last part)
const tail = lines.slice(950)
tail.forEach(l => { if (l.line) console.log(l.line) })
console.log('\nTotal:', lines.length)
